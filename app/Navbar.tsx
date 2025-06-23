"use client";

import Link from "next/link";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export default function Navbar() {
  const { user, loading } = useSupabaseUser();

  const handleSignOut = async () => {
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
    await fetch("/api/auth/session", { method: "DELETE", credentials: "include" });
    window.location.reload();
  };

  return (
    <nav className="w-full border-b border-gray-100 bg-white mb-6 text-base font-medium">
      <div className="max-w-5xl mx-auto flex justify-center gap-8 py-3 px-4 items-center">
        <Link href="/" className="hover:underline">Home</Link>
        
        {/* Role-based navigation */}
        {!loading && user && (
          <>
            {user.user_metadata?.role === "buyer" && (
              <>
                <Link href="/cart" className="hover:underline">Cart</Link>
                <Link href="/account" className="hover:underline">Account</Link>
              </>
            )}
            {user.user_metadata?.role === "vendor" && (
              <Link href="/vendor" className="hover:underline">Vendor Dashboard</Link>
            )}
          </>
        )}
        
        <div className="flex-1" />
        
        {!loading && user ? (
          <>
            <span className="mr-2 text-sm text-gray-700">{user.email}</span>
            <span className="mr-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {user.user_metadata?.role || 'user'}
            </span>
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