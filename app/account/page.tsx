"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OrderHistory from "../OrderHistory";

export default function AccountPage() {
  const { user, loading } = useSupabaseUser();
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
      
      const supabase = getBrowserSupabase();
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
  }, [user]);

  // Force session refresh if role is missing (fixes post-confirmation stale session)
  useEffect(() => {
    if (user && !user.user_metadata?.role) {
      const supabase = getBrowserSupabase();
      supabase.auth.refreshSession().then(() => window.location.reload());
    }
  }, [user]);

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

  // Show access denied message
  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            This page is only accessible to buyers. Vendors should use the vendor dashboard.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-black text-white px-6 py-2 rounded hover:opacity-90"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="max-w-xl mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Account</h1>
        <p className="mb-6">You need to sign in to view your account.</p>
        <Link href="/auth/sign-in" className="text-blue-600 hover:underline">Sign in</Link>
      </main>
    );
  }

  // Don't render the main content until we have a user and they're a buyer
  if (user.user_metadata?.role !== "buyer") {
    return null;
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
          const supabase = getBrowserSupabase();
          await supabase.auth.signOut();
          await fetch("/api/supabase/session", { method: "DELETE", credentials: "include" });
          window.location.reload();
        }}
        className="rounded bg-black text-white px-6 py-2 hover:opacity-90"
      >
        Sign out
      </button>
    </main>
  );
}
