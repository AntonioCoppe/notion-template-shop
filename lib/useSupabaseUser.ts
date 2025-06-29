"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "./supabase-browser";
import type { User, Session } from "@supabase/supabase-js";

export function useSupabaseUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getBrowserSupabase();

    const url = new URL(window.location.href);
    const urlAccessToken = url.searchParams.get("access_token");
    const urlRefreshToken = url.searchParams.get("refresh_token");

    const handleSession = async (session: Session | null) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (session) {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
        });
      }
    };

    if (urlAccessToken && urlRefreshToken) {
      supabase.auth
        .setSession({ access_token: urlAccessToken, refresh_token: urlRefreshToken })
        .then(async ({ data: { session } }) => {
          await handleSession(session);
        })
        .finally(() => {
          url.searchParams.delete("access_token");
          url.searchParams.delete("refresh_token");
          url.searchParams.delete("expires_in");
          url.searchParams.delete("refresh_token_expires_in");
          url.searchParams.delete("token_type");
          url.searchParams.delete("type");
          window.history.replaceState({}, "", url.pathname + url.search);
        });
    } else {
      // Immediately check for an existing session on mount
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        await handleSession(session);
      });
    }
    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      const sendTokens =
        session &&
        ["INITIAL_SESSION", "SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"].includes(
          event,
        );

      if (sendTokens) {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            access_token: session!.access_token,
            refresh_token: session!.refresh_token,
          }),
        });
      }

      if (event === "SIGNED_OUT") {
        await fetch("/api/auth/session", {
          method: "DELETE",
          credentials: "include",
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
} 