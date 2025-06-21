// app/api/stripe/account-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(req: NextRequest) {
  const acct = req.nextUrl.searchParams.get("acct");
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }
  if (!acct) {
    return NextResponse.json(
      { error: "Missing account id" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
  });

  try {
    const account = await stripe.accounts.retrieve(acct);
    return NextResponse.json(account);
  } catch (err) {
    console.error("Error fetching account status:", err);
    return NextResponse.json(
      { error: "Failed to retrieve account status" },
      { status: 500 }
    );
  }
}
