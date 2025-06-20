"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = getBrowserSupabase();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <nav className="w-full border-b border-gray-100 bg-white mb-6 text-base font-medium">
      <div className="max-w-5xl mx-auto flex justify-center gap-8 py-3 px-4 items-center">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/cart" className="hover:underline">Cart</Link>
        <Link href="/account" className="hover:underline">Account</Link>
        <div className="flex-1" />
        {user ? (
          <>
            <span className="mr-2 text-sm text-gray-700">{user.email}</span>
            {user.user_metadata?.role === "vendor" && (
              <Link href="/vendor" className="text-sm underline text-blue-600 hover:text-blue-800 mr-2">Vendor Dashboard</Link>
            )}
            <button onClick={handleSignOut} className="text-sm underline text-blue-600 hover:text-blue-800">Sign out</button>
          </>
        ) : (
          <>
            <Link href="/auth/sign-in" className="underline mr-2">Sign in</Link>
            <Link href="/auth/sign-up" className="underline">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
} 