import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // You can omit apiVersion here if you initialized Stripe without it
    apiVersion: "2025-05-28.basil",
});

export async function POST(req: NextRequest) {
    try {
        const { priceId, email } = await req.json();

        if (!priceId || !email) {
            return NextResponse.json(
                { error: "Missing priceId or email in request" },
                { status: 400 }
            );
        }

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            customer_email: email,
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
            automatic_tax: { enabled: false },
        });

        return NextResponse.json({ url: session.url });
    } catch (err: unknown) {
        console.error("⚠️ stripe checkout error:", err);
        const errorMessage =
            err instanceof Error ? err.message : "Internal Server Error";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
