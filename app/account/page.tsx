"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/session-provider";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OrderHistory from "../OrderHistory";

export default function AccountPage() {
  const { user, loading } = useSupabaseUser();
  const { supabase } = useSupabase();
  const router = useRouter();
  const [buyerId, setBuyerId] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // Enhanced access control with loading state
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/sign-in?redirect=/account");
        return;
      }
      
      if (user.user_metadata?.role !== "buyer") {
        setAccessDenied(true);
        return;
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchBuyerId = async () => {
      if (!user) return;
      
      const { data: buyerData, error: buyerError } = await supabase
        .from("buyers")
        .select("id")
        .eq("user_id", user.id)
        .single();
      
      if (!buyerError && buyerData) {
        setBuyerId(buyerData.id);
      }
    };

    if (user && user.user_metadata?.role === "buyer") {
      fetchBuyerId();
    }
  }, [user, supabase]);

  // Force session refresh if role is missing (fixes post-confirmation stale session)
  useEffect(() => {
    if (user && !user.user_metadata?.role) {
      supabase.auth.refreshSession().then(() => window.location.reload());
    }
  }, [user, supabase]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied
  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            This page is only available to buyers.
          </p>
          <Link
            href="/"
            className="inline-block bg-black text-white px-6 py-2 rounded hover:opacity-90"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Show not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Not Authenticated</h1>
          <p className="text-gray-600 mb-4">
            Please sign in to access your account.
          </p>
          <Link
            href="/auth/sign-in"
            className="inline-block bg-black text-white px-6 py-2 rounded hover:opacity-90"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Account</h1>
      <div className="mb-6">Signed in as <span className="font-mono bg-gray-100 px-2 py-1 rounded">{user.email}</span></div>
      
      <h2 className="text-lg font-semibold mb-4">Order History</h2>
      {buyerId ? (
        <OrderHistory buyerId={buyerId} />
      ) : (
        <div className="text-gray-500 mb-8">No buyer account found.</div>
      )}
      
      <button
        onClick={async () => {
          try {
            const { signOut: nextAuthSignOut } = await import("next-auth/react");
            console.log("▶️ NextAuth signOut");
            await nextAuthSignOut({ callbackUrl: '/auth/sign-in' });
            console.log("✅ NextAuth cookies cleared and redirected");
          } catch (err) {
            console.error("❌ NextAuth signOut error:", err);
          }
          try {
            console.log("▶️ supabase-js signOut");
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            console.log("✅ supabase-js signOut complete");
          } catch (err) {
            console.error("❌ supabase-js signOut error:", err);
          }
          try {
            console.log("▶️ delete server-side supabase cookie");
            const res = await fetch("/api/supabase/session", { method: "DELETE" });
            console.log("✅ server-side Supabase cookie cleared, status=", res.status);
          } catch (err) {
            console.error("❌ server-side supabase cookie DELETE error:", err);
          }
          // No need for window.location.href because NextAuth already redirected
        }}
        className="rounded bg-black text-white px-6 py-2 hover:opacity-90"
      >
        Sign out
      </button>
    </main>
  );
}
