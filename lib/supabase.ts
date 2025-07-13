import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  // Use service role key only on the server, never in the browser!
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = typeof window === 'undefined'
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are missing");
  }

  if (!client) {
    if (typeof window === 'undefined') {
      client = createClient(url, key, { auth: { persistSession: false } });
    } else {
      client = createBrowserClient(url, key);
    }
  }

  return client;
}
