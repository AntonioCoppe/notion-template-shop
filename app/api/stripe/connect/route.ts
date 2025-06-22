// app/api/stripe/connect/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return new NextResponse("Server config error", { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
  });
  const supabase = getSupabase();
  const { vendorId } = await req.json();
  const origin = new URL(req.url).origin;

  if (!vendorId) {
    return NextResponse.json({ error: "Missing vendorId" }, { status: 400 });
  }

  // 1) Load existing vendor record, now including country
  const { data: vendor, error: vendorErr } = await supabase
    .from("vendors")
    .select("stripe_account_id, user_id, country")
    .eq("id", vendorId)
    .single();

  if (vendorErr || !vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  let accountId = vendor.stripe_account_id;

  // 2) If they’ve never connected, create an Express account in their country
  if (!accountId) {
    const { data: user, error: userErr } = await supabase
      .from("auth.users")
      .select("email")
      .eq("id", vendor.user_id)
      .single();

    if (userErr || !user) {
      return NextResponse.json({ error: "Vendor user not found" }, { status: 404 });
    }

    const acct = await stripe.accounts.create({
      type: "express",
      country: vendor.country,         // ← vendor’s chosen country
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers:     { requested: true },
      },
      business_profile: {
        name: "Notion Template Shop",  // ← your platform’s public name
        url:  "https://www.notiontemplateshop.com",
      },
    });

    accountId = acct.id;

    // save it back to supabase
    await supabase
      .from("vendors")
      .update({ stripe_account_id: accountId })
      .eq("id", vendorId);
  }

  // 3) Generate an onboarding link
  const link = await stripe.accountLinks.create({
    account:      accountId,
    refresh_url:  `${origin}/vendor/onboarding?status=refresh`,
    return_url:   `${origin}/vendor?status=connected`,
    type:         "account_onboarding",
  });

  return NextResponse.json({ url: link.url });
}
