// lib/stripeConnect.ts
import { getSupabase } from "@/lib/supabase";

export class VendorNotConnectedError extends Error {
  constructor(vendorId: string) {
    super(`Vendor ${vendorId} not connected to Stripe`);
    this.name = "VendorNotConnectedError";
  }
}

/**
 * Resolve the Stripe Connect account ID for a given vendor,
 * optionally falling back to your own platform account in dev/test.
 */
export async function getStripeAccountForVendor(
  vendorId: string,
  opts: { fallbackToPlatform?: boolean } = {}
): Promise<string> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("vendors")
    .select("stripe_account_id")
    .eq("id", vendorId)
    .single();

  if (error) {
    console.error("[stripeConnect] supabase error:", error);
    throw error;
  }
  const acct = data?.stripe_account_id;
  if (!acct) {
    if (opts.fallbackToPlatform && process.env.STRIPE_ACCOUNT_ID) {
      console.warn(
        `[stripeConnect] no account for vendor ${vendorId}, falling back to platform`
      );
      return process.env.STRIPE_ACCOUNT_ID;
    }
    throw new VendorNotConnectedError(vendorId);
  }
  return acct;
}
