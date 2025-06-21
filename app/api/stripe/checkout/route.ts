// app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabase } from "@/lib/supabase";
import {
  getStripeAccountForVendor,
  VendorNotConnectedError,
} from "@/lib/stripeConnect";

// Custom error for missing transfer capability
export class InsufficientCapabilitiesError extends Error {
  constructor(accountId: string) {
    super(`Stripe account ${accountId} is not ready to receive transfers`);
    this.name = "InsufficientCapabilitiesError";
  }
}

export async function POST(req: NextRequest) {
  // 1) Env check
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
  });
  const supabase = getSupabase();

  try {
    // 2) Parse + validate body
    const { email, cartDetails } = await req.json();
    if (typeof email !== "string" || !Array.isArray(cartDetails)) {
      return NextResponse.json(
        { error: "Missing email or cartDetails" },
        { status: 400 }
      );
    }

    // 3) Load templates
    const templateIds = cartDetails.map((c: { id: string }) => c.id);
    const { data: templates, error: tplErr } = await supabase
      .from("templates")
      .select("id, title, price, vendor_id")
      .in("id", templateIds);

    if (tplErr || !templates?.length) {
      return NextResponse.json(
        { error: "Templates not found" },
        { status: 404 }
      );
    }

    // 4) Single-vendor guard
    const vendorId = templates[0].vendor_id;
    if (!templates.every((t) => t.vendor_id === vendorId)) {
      return NextResponse.json(
        { error: "Only one vendor allowed per checkout" },
        { status: 400 }
      );
    }

    // 5) Resolve Connect account ID
    let destination: string;
    try {
      destination = await getStripeAccountForVendor(vendorId, {
        fallbackToPlatform: process.env.NODE_ENV !== "production",
      });
    } catch (err) {
      if (err instanceof VendorNotConnectedError) {
        return NextResponse.json(
          { error: "This vendor cannot accept payments yet." },
          { status: 400 }
        );
      }
      throw err;
    }

    // 6) Ensure account has transfer capability
    try {
      const adminStripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-05-28.basil",
      });
      const acct = await adminStripe.accounts.retrieve(destination);
      if (acct.capabilities?.transfers !== "active") {
        throw new InsufficientCapabilitiesError(destination);
      }
    } catch (err) {
      if (err instanceof InsufficientCapabilitiesError) {
        return NextResponse.json(
          {
            error:
              "The vendor’s Stripe account isn’t fully activated. Please reconnect to finish onboarding.",
          },
          { status: 400 }
        );
      }
      throw err;
    }

    // 7) Build line items, handling missing products
    const line_items = await Promise.all(
      templates.map(async (t) => {
        const key = `template_${t.id}`;
        let priceId: string | undefined;

        // attempt to list existing price
        try {
          const list = await stripe.prices.list({ product: key, limit: 1 });
          if (list.data.length) {
            priceId = list.data[0].id;
          }
        } catch (err: any) {
          if (err.code !== "resource_missing") throw err;
        }

        // create product+price if needed
        if (!priceId) {
          const product = await stripe.products.create({
            name: t.title,
            metadata: { template_id: t.id },
          });
          const price = await stripe.prices.create({
            product: product.id,
            unit_amount: Math.round(t.price * 100),
            currency: "usd",
          });
          priceId = price.id;
        }

        return { price: priceId!, quantity: 1 };
      })
    );

    // 8) Compute fee & create session
    const total = templates.reduce((sum, t) => sum + t.price, 0);
    const application_fee = Math.round(total * 100 * 0.1);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
      payment_intent_data: {
        application_fee_amount: application_fee,
        transfer_data: { destination },
      },
      metadata: {
        template_ids: templateIds.join(","),
        vendor_id: vendorId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error("⚠️ [stripe/checkout] error:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
