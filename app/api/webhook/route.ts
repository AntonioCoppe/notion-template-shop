import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import templates from "@/app/templates";

export const runtime = "nodejs";            // need Buffer

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  // 1. Verify signature (await headers() first!)
  const sig = (await headers()).get("stripe-signature")!;
  const rawBody = await req.arrayBuffer();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(rawBody),
      sig,
      endpointSecret,
    );
  } catch (err) {
    return new NextResponse(
      `Webhook signature verification failed: ${(err as Error).message}`,
      { status: 400 },
    );
  }

  // 2. On successful payment, e-mail template link
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 1,
    });
    const priceId = lineItems.data[0].price?.id;

    const template = templates.find((t) => t.priceId === priceId);

    if (template && session.customer_email) {
      await resend.emails.send({
        from: "Notion Template Shop <support@notiontemplateshop.com>",
        to: session.customer_email,
        subject: `Your ${template.title} Notion template`,
        html: `
          <p>Hi!</p>
          <p>Thanks for purchasing <strong>${template.title}</strong>.</p>
          <p>
            ➡️ <a href="${template.notionUrl}">Duplicate the template into your workspace</a>
          </p>
          <p>Happy templating,<br/>Antonio @ Notion Template Shop</p>
        `,
      });
    }
  }

  return NextResponse.json({ received: true });
}
