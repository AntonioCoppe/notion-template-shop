// app/api/stripe/connect/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabase } from "@/lib/supabase";
import { authenticateUser, requireVendor } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  try {
    // Authenticate and verify vendor role
    const user = await authenticateUser(req);
    const vendor = requireVendor(user);

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

    // Verify the vendor belongs to the authenticated user
    const { data: vendorData, error: vendorErr } = await supabase
      .from("vendors")
      .select("stripe_account_id, user_id, country")
      .eq("id", vendorId)
      .eq("user_id", vendor.id)
      .single();

    if (vendorErr || !vendorData) {
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

    return NextResponse.json({ url: link.url });
  } catch (error) {
    console.error("Stripe connect error:", error);
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
