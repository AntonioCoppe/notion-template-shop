"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = getBrowserSupabase();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
      // If the user is a buyer, redirect to the storefront
      if (data.user?.user_metadata?.role === "buyer") {
        router.replace("/?buyer=1");
      }
    };
    fetchUser();
  }, [router]);

  if (loading) {
    return <main className="max-w-md mx-auto px-4 py-20 text-center">Loading...</main>;
  }

  return (
    <main className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold mb-4 text-center">Dashboard</h1>
      <p className="text-center">Welcome, {user?.email || "buyer"}! This is your dashboard.</p>
    </main>
  );
} 