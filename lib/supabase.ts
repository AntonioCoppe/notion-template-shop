import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = typeof window === 'undefined'
    ? process.env.SUPABASE_SERVICE_ROLE_KEY!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url || !key) {
    throw new Error("Supabase environment variables are missing");
  }

  if (typeof window === 'undefined') {
    // Server: create a new client with the service role key
    return createClient(url, key, { auth: { persistSession: false } });
  } else {
    // Browser: always create a new client to ensure correct session/cookie context
    return createBrowserClient(url, key);
  }
}
