// app/api/webhook/route.ts
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { getSupabase } from "@/lib/supabase";

interface TemplateRecord {
  id: string;
  title: string;
  price: number;
  notion_url: string;
}

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.RESEND_API_KEY ||
    !process.env.STRIPE_WEBHOOK_SECRET
  ) {
    console.error("Missing webhook env vars");
    return new NextResponse("Server config error", { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
  });
  const resend = new Resend(process.env.RESEND_API_KEY);

  const signature = (await headers()).get("stripe-signature")!;
  const buf = await req.arrayBuffer();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(buf),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (e) {
    console.error("Webhook signature failed:", (e as Error).message);
    return new NextResponse("Bad signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const ids = session.metadata?.template_ids?.split(",");

    if (ids?.length && session.customer_email) {
      try {
        const supabase = getSupabase();

        const { data, error: tplError } = await supabase
          .from("templates")
          .select("id, title, price, notion_url")
          .in("id", ids);

        if (tplError) {
          console.error("Templates fetch error:", tplError);
          return new NextResponse(null, { status: 200 });
        }

        const templates = (data as TemplateRecord[]) ?? [];
        if (!templates.length) {
          console.warn("No templates in webhook for IDs:", ids);
          return new NextResponse(null, { status: 200 });
        }

        const { data: userData, error: userErr } = await supabase
          .from("auth.users")
          .select("id")
          .eq("email", session.customer_email)
          .single();
        if (userErr || !userData) throw new Error("User not found");

        const { data: buyerData, error: buyerErr } = await supabase
          .from("buyers")
          .select("id")
          .eq("user_id", userData.id)
          .single();
        if (buyerErr || !buyerData) throw new Error("Buyer not found");

        const orders = templates.map((t) => ({
          buyer_id: buyerData.id,
          template_id: t.id,
          amount: t.price,
          status: "paid",
        }));
        await supabase.from("orders").insert(orders);

        const htmlList = templates
          .map((t) => `<li><a href="${t.notion_url}">${t.title}</a></li>`)
          .join("");
        await resend.emails.send({
          from: "Notion Template Shop <noreply@notiontemplateshop.com>",
          to: session.customer_email,
          subject: `Your Notion templates are here!`,
          html: `<p>Thanks for your purchase! Here are your templates:</p><ul>${htmlList}</ul>`,
        });

        console.log(`✅ Email sent to ${session.customer_email}`);
      } catch (e) {
        console.error("Webhook processing error:", (e as Error).message);
      }
    }
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}
