import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
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

    const templateIds = session.metadata?.template_ids?.split(',');
    
    if (templateIds && templateIds.length > 0 && session.customer_email) {
      try {
        // Fetch templates from database
        const { data: templates, error: templatesError } = await supabase
          .from("templates")
          .select("*")
          .in("id", templateIds);

        if (templatesError || !templates || templates.length === 0) {
          console.error("Templates not found for IDs:", templateIds.join(', '));
          return NextResponse.json({ received: true }); 
        }

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
        
        // Store the orders in Supabase
        const orders = templates.map(template => ({
          buyer_id: buyerData.id,
          template_id: template.id,
          amount: template.price,
          status: 'paid',
        }));
        await supabase.from("orders").insert(orders);

        // Send a single email with all template links
        const templateLinks = templates.map(t => 
          `<li><a href="${t.notion_url}">${t.title}</a></li>`
        ).join('');

        await resend.emails.send({
          from: "Notion Template Shop <noreply@notiontemplateshop.com>",
          to: session.customer_email,
          subject: `Your Notion templates are here!`,
          html: `
            <p>Hi there!</p>
            <p>Thanks for your purchase. Here are your templates:</p>
            <ul>${templateLinks}</ul>
            <p>Happy templating,<br/>Antonio @ Notion Template Shop</p>
          `,
        });
        console.log(`✅ Consolidated email sent to ${session.customer_email} for ${templates.length} templates.`);
      } catch (err) {
        console.error("❌ Failed to process multi-item order:", (err as Error).message);
      }
    } else {
      console.warn("⚠️ Missing template_ids in metadata or customer email in session.");
    }
  }

  return NextResponse.json({ received: true });
}
