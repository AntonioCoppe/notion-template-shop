"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "./session-provider";
import type { Session } from "@supabase/supabase-js";

export function useSupabaseUser() {
  const { supabase, user, loading } = useSupabase();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const urlAccessToken = url.searchParams.get("access_token");
    const urlRefreshToken = url.searchParams.get("refresh_token");

    const handleSession = async (session: Session | null) => {
      if (session) {
        await fetch("/api/supabase/session", {
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

    setIsInitialized(true);
  }, [supabase]);

  // Listen for auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const sendTokens =
        session &&
        ["INITIAL_SESSION", "SIGNED_IN", "TOKEN_REFRESHED", "USER_UPDATED"].includes(
          event,
        );

      if (sendTokens) {
        await fetch("/api/supabase/session", {
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
        await fetch("/api/supabase/session", {
          method: "DELETE",
          credentials: "include",
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, loading: loading || !isInitialized };
} 