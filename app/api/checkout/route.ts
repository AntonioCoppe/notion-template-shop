import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabase } from "@/lib/supabase";

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
    const { templateId, email } = await req.json();

    if (!templateId || !email) {
      return NextResponse.json(
        { error: "Missing templateId or email in request" },
        { status: 400 }
      );
    }

    // Fetch template from database
    const supabase = getSupabase();
    const { data: template, error: templateError } = await supabase
      .from("templates")
      .select(`
        id,
        title,
        price,
        notion_url,
        vendor_id,
        vendors!inner(
          stripe_account_id
        )
      `)
      .eq("id", templateId)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const vendors = template.vendors as { stripe_account_id: string | null }[];
    const vendor = vendors[0];
    if (!vendor?.stripe_account_id) {
      return NextResponse.json(
        { error: "Vendor not connected to Stripe" },
        { status: 400 }
      );
    }

    // Create or get Stripe product and price
    let priceId: string;
    
    // Check if we already have a price for this template
    const existingPrices = await stripe.prices.list({
      product: `template_${template.id}`,
      active: true,
      limit: 1,
    });

    if (existingPrices.data.length > 0) {
      priceId = existingPrices.data[0].id;
    } else {
      // Create a new product and price
      const product = await stripe.products.create({
        id: `template_${template.id}`,
        name: template.title,
        description: `Notion template: ${template.title}`,
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(template.price * 100), // Convert to cents
        currency: "usd",
      });

      priceId = price.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
      automatic_tax: { enabled: false },
      payment_intent_data: {
        application_fee_amount: Math.round(template.price * 10), // 10% platform fee
        transfer_data: {
          destination: vendor.stripe_account_id,
        },
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
