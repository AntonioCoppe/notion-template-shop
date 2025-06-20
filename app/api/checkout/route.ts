import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabase } from "@/lib/supabase";

type Vendor = {
  stripe_account_id: string;
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Missing STRIPE_SECRET_KEY environment variable");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
  });

  try {
    const { cartDetails, email } = await req.json();

    if (!cartDetails || !email) {
      return NextResponse.json(
        { error: "Missing cartDetails or email in request" },
        { status: 400 }
      );
    }

    const templateIds = cartDetails.map((item: { id: string }) => item.id);
    
    const supabase = getSupabase();
    const { data: templates, error: templatesError } = await supabase
      .from("templates")
      .select(`
        id,
        title,
        price,
        notion_url,
        vendor_id,
        vendors (
          stripe_account_id
        )
      `)
      .in("id", templateIds);

    if (templatesError || !templates || templates.length === 0) {
      console.error("Error fetching templates:", templatesError);
      return NextResponse.json(
        { error: "Templates not found" },
        { status: 404 }
      );
    }
    
    const firstVendorId = templates[0].vendor_id;
    const allSameVendor = templates.every(t => t.vendor_id === firstVendorId);
    
    if (!allSameVendor) {
      return NextResponse.json(
          { error: "You can only purchase templates from one vendor at a time." },
          { status: 400 }
      );
    }

    const vendorStripeAccountId = (templates[0].vendors as Vendor[])[0]?.stripe_account_id;
    if (!vendorStripeAccountId) {
      return NextResponse.json(
        { error: "Vendor not connected to Stripe" },
        { status: 400 }
      );
    }

    const line_items = await Promise.all(
      templates.map(async (template) => {
        let priceId: string;
        const existingPrices = await stripe.prices.list({
          product: `template_${template.id}`,
          active: true,
          limit: 1,
        });

        if (existingPrices.data.length > 0) {
          priceId = existingPrices.data[0].id;
        } else {
          const product = await stripe.products.create({
            id: `template_${template.id}`,
            name: template.title,
            description: `Notion template: ${template.title}`,
          });

          const price = await stripe.prices.create({
            product: product.id,
            unit_amount: Math.round(template.price * 100),
            currency: "usd",
          });
          priceId = price.id;
        }

        return {
          price: priceId,
          quantity: 1,
        };
      })
    );

    const totalAmount = templates.reduce((acc, t) => acc + t.price, 0);
    const platformFee = totalAmount * 0.10;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: line_items,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
      automatic_tax: { enabled: false },
      payment_intent_data: {
        application_fee_amount: Math.round(platformFee * 100),
        transfer_data: {
          destination: vendorStripeAccountId,
        },
      },
      metadata: {
        template_ids: templateIds.join(','),
      },
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
