// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabase } from "@/lib/supabase";

interface TemplateRecord {
  id: string;
  title: string;
  price: number;
  notion_url: string;
  vendor_id: string;
  vendors?: { stripe_account_id: string }[];
}

export async function POST(req: NextRequest) {
  console.log("🚀 [checkout] handler invoked");
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("❌ [checkout] Missing STRIPE_SECRET_KEY");
    console.log("🔻 [checkout] returning 500 { error: 'Server configuration error' }");
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
    const body = await req.json();
    console.log("📥 [checkout] request body:", body);

    const { cartDetails, email } = body;
    if (!Array.isArray(cartDetails) || typeof email !== "string") {
      console.error("❌ [checkout] Missing or invalid cartDetails/email");
      console.log("🔻 [checkout] returning 400 { error: 'Missing cartDetails or email' }");
      return NextResponse.json(
        { error: "Missing cartDetails or email" },
        { status: 400 }
      );
    }

    const templateIds = cartDetails.map((item: { id: string }) => item.id);
    console.log("🔍 [checkout] looking up templates for IDs:", templateIds);

    const { data, error: fetchError } = await supabase
      .from("templates")
      .select(`
        id, title, price, notion_url, vendor_id,
        vendors ( stripe_account_id )
      `)
      .in("id", templateIds);

    if (fetchError) {
      console.error("❌ [checkout] Supabase fetch error:", fetchError);
      console.log("🔻 [checkout] returning 500 { error: 'Error fetching templates' }");
      return NextResponse.json(
        { error: "Error fetching templates" },
        { status: 500 }
      );
    }

    const templates = (data as TemplateRecord[]) || [];
    if (templates.length === 0) {
      console.warn("⚠️ [checkout] No templates found for IDs:", templateIds);
      console.log("🔻 [checkout] returning 404 { error: 'Templates not found' }");
      return NextResponse.json(
        { error: "Templates not found" },
        { status: 404 }
      );
    }

    // single‐vendor guard
    const firstVendor = templates[0].vendor_id;
    if (!templates.every((t) => t.vendor_id === firstVendor)) {
      console.error("❌ [checkout] Multiple vendors in cart:", templates.map(t => t.vendor_id));
      console.log("🔻 [checkout] returning 400 { error: 'You can only purchase templates from one vendor at a time.' }");
      return NextResponse.json(
        { error: "You can only purchase templates from one vendor at a time." },
        { status: 400 }
      );
    }

    const vendorStripeAccountId = templates[0].vendors?.[0]?.stripe_account_id;
    if (!vendorStripeAccountId) {
      console.error("❌ [checkout] Vendor not connected to Stripe for vendor_id:", firstVendor);
      console.log("🔻 [checkout] returning 400 { error: 'Vendor not connected to Stripe' }");
      return NextResponse.json(
        { error: "Vendor not connected to Stripe" },
        { status: 400 }
      );
    }

    // build line items
    console.log("🔃 [checkout] creating Stripe line items…");
    const line_items = await Promise.all(
      templates.map(async (template) => {
        const prices = await stripe.prices.list({
          product: `template_${template.id}`,
          active: true,
          limit: 1,
        });

        let priceId: string;
        if (prices.data.length) {
          priceId = prices.data[0].id;
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
        return { price: priceId, quantity: 1 };
      })
    );

    const total = templates.reduce((sum, t) => sum + t.price, 0);
    const applicationFee = Math.round(total * 100 * 0.1);
    console.log(`💰 [checkout] total=$${total} applicationFee=${applicationFee}`);

    // create session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
      payment_intent_data: {
        application_fee_amount: applicationFee,
        transfer_data: { destination: vendorStripeAccountId },
      },
      metadata: { template_ids: templateIds.join(",") },
    });

    console.log("✅ [checkout] returning 200 { url:", session.url, "}");
    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error("⚠️ [checkout] unexpected error:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    console.log("🔻 [checkout] returning 500 { error:", message, "}");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
