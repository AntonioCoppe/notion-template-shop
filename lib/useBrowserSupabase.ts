"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function useBrowserSupabase(): SupabaseClient | null {
  const [client, setClient] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    const newClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    setClient(newClient);
  }, [document.cookie]);

  return client;
}
