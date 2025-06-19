import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  // Validate all required environment variables
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Missing STRIPE_SECRET_KEY environment variable");
    return NextResponse.json(
      { error: "Server configuration error: Missing Stripe secret key" },
      { status: 500 }
    );
  }

  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    console.error("Missing NEXT_PUBLIC_SITE_URL environment variable");
    return NextResponse.json(
      { error: "Server configuration error: Missing site URL" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
  });

  try {
    const { vendorId } = await req.json();

    if (!vendorId) {
      return NextResponse.json(
        { error: "Missing vendorId in request" },
        { status: 400 }
      );
    }

    // First, get the vendor data including user email
    const supabase = getSupabase();
    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select(`
        id,
        user_id,
        stripe_account_id,
        users!inner(
          email
        )
      `)
      .eq("id", vendorId)
      .single();

    if (vendorError || !vendor) {
      console.error("Error fetching vendor:", vendorError);
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Check if vendor already has a Stripe account
    if (vendor.stripe_account_id) {
      return NextResponse.json(
        { error: "Vendor already has a Stripe account" },
        { status: 400 }
      );
    }

    // Access the user email from the nested structure
    const users = vendor.users as { email: string }[];
    const userEmail = users[0]?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Vendor email not found" },
        { status: 400 }
      );
    }

    console.log(`Creating Stripe Connect account for vendor ${vendorId} with email ${userEmail}`);

    // Create a Stripe Connect account
    const account = await stripe.accounts.create({
      type: "express",
      country: "US", // You might want to make this configurable
      email: userEmail,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual", // or "company" based on your needs
      business_profile: {
        url: process.env.NEXT_PUBLIC_SITE_URL,
        mcc: "5734", // Computer Software Stores
      },
    });

    console.log(`Created Stripe account ${account.id} for vendor ${vendorId}`);

    // Update the vendor record with the Stripe account ID
    const { error: updateError } = await supabase
      .from("vendors")
      .update({ stripe_account_id: account.id })
      .eq("id", vendorId);

    if (updateError) {
      console.error("Error updating vendor:", updateError);
      // Try to delete the Stripe account if we can't update the database
      try {
        await stripe.accounts.del(account.id);
        console.log(`Deleted Stripe account ${account.id} due to database update failure`);
      } catch (deleteError) {
        console.error("Error deleting Stripe account:", deleteError);
      }
      return NextResponse.json(
        { error: "Failed to update vendor record" },
        { status: 500 }
      );
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/vendor`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/vendor`,
      type: "account_onboarding",
      collect: "eventually_due",
    });

    console.log(`Created account link for vendor ${vendorId}: ${accountLink.url}`);

    return NextResponse.json({ url: accountLink.url });
  } catch (err: unknown) {
    console.error("⚠️ Stripe connect error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 