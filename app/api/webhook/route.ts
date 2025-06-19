import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import templates from "@/app/templates";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs"; // Ensure Buffer is available

export async function POST(req: Request) {
  if (
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.RESEND_API_KEY ||
    !process.env.STRIPE_WEBHOOK_SECRET
  ) {
    console.error("Missing Stripe/Resend environment variables");
    return new NextResponse("Server configuration error", { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const resend = new Resend(process.env.RESEND_API_KEY);
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  // 🟢 Diagnostic log to confirm the handler is invoked
  console.log("🟢 Webhook hit at", new Date().toISOString());

  // 1. Verify Stripe signature
  const sig = (await headers()).get("stripe-signature")!;
  const rawBody = await req.arrayBuffer();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(rawBody),
      sig,
      endpointSecret
    );
  } catch (err) {
    console.error("❌ Signature verification failed:", (err as Error).message);
    return new NextResponse(
      `Webhook signature verification failed: ${(err as Error).message}`,
      { status: 400 }
    );
  }

  // 2. Handle checkout completion
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = getSupabase();

    // Retrieve line items to get the price ID
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 1,
    });
    const priceId = lineItems.data[0].price?.id;

    // Find the matching template in your in-memory catalogue
    const template = templates.find((t) => t.priceId === priceId);

    if (template && session.customer_email) {
      try {
        // Look up the buyer by email
        const { data: userData, error: userError } = await supabase
          .from('auth.users')
          .select('id')
          .eq('email', session.customer_email)
          .single();
        if (userError || !userData) throw new Error('User not found');
        const { data: buyerData, error: buyerError } = await supabase
          .from('buyers')
          .select('id')
          .eq('user_id', userData.id)
          .single();
        if (buyerError || !buyerData) throw new Error('Buyer not found');
        // Store the order in Supabase
        await supabase.from("orders").insert({
          buyer_id: buyerData.id,
          template_id: template.id,
          amount: template.price,
          status: 'paid',
        });

        // Send the Notion duplicate link via email
        await resend.emails.send({
          from: "Notion Template Shop <support@notiontemplateshop.com>",
          to: session.customer_email,
          subject: `Your ${template.title} Notion template`,
          html: `
            <p>Hi there!</p>
            <p>Thanks for purchasing <strong>${template.title}</strong>.</p>
            <p>
              ➡️ <a href="${template.notionUrl}">Click here to duplicate the template into your workspace</a>
            </p>
            <p>Happy templating,<br/>Antonio @ Notion Template Shop</p>
          `,
        });
        console.log(`✅ Email sent to ${session.customer_email}`);
      } catch (emailErr) {
        console.error("❌ Failed to process order:", (emailErr as Error).message);
      }
    } else {
      console.warn("⚠️ No template match or missing customer email");
    }
  }

  return NextResponse.json({ received: true });
}
