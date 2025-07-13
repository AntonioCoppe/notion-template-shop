"use client";

import SupabaseProvider from "@/lib/session-provider";
import { useSupabaseAuth } from "@/lib/useSupabaseAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/lib/session-provider";

function GlobalAuthListener() {
  const { supabase } = useSupabase();
  const router = useRouter();
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.push("/auth/sign-in");
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [supabase, router]);
  return null;
}

function AuthHandler({ children }: { children: React.ReactNode }) {
  useSupabaseAuth();
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <GlobalAuthListener />
      <AuthHandler>
        {children}
      </AuthHandler>
    </SupabaseProvider>
  );
} 