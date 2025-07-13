// app/api/stripe/connect/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabase } from "@/lib/supabase";
import { authenticateUser, requireVendor } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  console.log('⚡️ Stripe connect handler hit', { url: req.url, method: req.method });
  try {
    // Authenticate and verify vendor role
    const user = await authenticateUser(req);
    const vendor = requireVendor(user);
    const vendorId = (await req.json()).vendorId;
    console.log('Stripe connect POST for vendorId:', vendorId, 'userId:', vendor.id);

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing STRIPE_SECRET_KEY env var');
      return new NextResponse("Server config error", { status: 500 });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-05-28.basil",
    });
    const supabase = getSupabase();
    const origin = new URL(req.url).origin;

    if (!vendorId) {
      console.error('Missing vendorId in request body');
      return NextResponse.json({ error: "Missing vendorId" }, { status: 400 });
    }

    // Verify the vendor belongs to the authenticated user
    const { data: vendorData, error: vendorErr } = await supabase
      .from("vendors")
      .select("stripe_account_id, user_id, country")
      .eq("id", vendorId)
      .eq("user_id", vendor.id)
      .single();

    if (vendorErr || !vendorData) {
      console.error('Vendor not found or access denied', { vendorErr, vendorId, userId: vendor.id });
      return NextResponse.json({ error: "Vendor not found or access denied" }, { status: 404 });
    }

    let accountId = vendorData.stripe_account_id;

    // 2) If they've never connected, create an Express account in their country
    if (!accountId) {
      const { data: userData, error: userErr } = await supabase
        .from("auth.users")
        .select("email")
        .eq("id", vendorData.user_id)
        .single();

      if (userErr || !userData) {
        console.error('Vendor user not found', { userErr, vendorId, userId: vendor.id });
        return NextResponse.json({ error: "Vendor user not found" }, { status: 404 });
      }

      const acct = await stripe.accounts.create({
        type: "express",
        country: vendorData.country,         // ← vendor's chosen country
        email: userData.email,
        capabilities: {
          card_payments: { requested: true },
          transfers:     { requested: true },
        },
        business_profile: {
          name: "Notion Template Shop",  // ← your platform's public name
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
    console.log('Stripe onboarding link generated', { accountId, vendorId, userId: vendor.id, onboardingUrl: link.url });
    return NextResponse.json({ url: link.url });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Stripe connect error:", error, { errorString: error.toString(), stack: error.stack });
    } else {
      console.error("Stripe connect error:", error);
    }
    if (error instanceof Error) {
      if (error.message === "Authentication required") {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      if (error.message.includes("Access denied")) {
        return NextResponse.json({ error: "Access denied. Vendor role required." }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
