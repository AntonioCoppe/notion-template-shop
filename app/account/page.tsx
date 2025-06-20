"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = getBrowserSupabase();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  if (!user) {
    return (
      <main className="max-w-xl mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Account</h1>
        <p className="mb-6">You need to sign in to view your account.</p>
        <Link href="/auth/sign-in" className="text-blue-600 hover:underline">Sign in</Link>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Account</h1>
      <div className="mb-6">Signed in as <span className="font-mono bg-gray-100 px-2 py-1 rounded">{user.email}</span></div>
      <h2 className="text-lg font-semibold mb-2">Order History</h2>
      <div className="text-gray-500 mb-8">(Order history coming soon)</div>
      <button
        onClick={async () => {
          const supabase = getBrowserSupabase();
          await supabase.auth.signOut();
          window.location.reload();
        }}
        className="rounded bg-black text-white px-6 py-2 hover:opacity-90"
      >
        Sign out
      </button>
    </main>
  );
}
