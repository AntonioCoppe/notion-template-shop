"use client";

import Link from "next/link";
import { useSupabase } from "@/lib/session-provider";

export default function Navbar() {
  const { user, loading, supabase } = useSupabase();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await fetch("/api/auth/session", { method: "DELETE", credentials: "include" });
    window.location.reload();
  };

  return (
    <nav className="w-full border-b mb-6 text-base font-medium" style={{ background: 'var(--background)', borderColor: 'var(--divider)', color: 'var(--foreground)' }}>
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
            <span className="mr-2 text-sm" style={{ color: 'var(--foreground)' }}>{user.email}</span>
            <span className="mr-2 text-xs px-2 py-1 rounded" style={{ color: 'var(--foreground)', background: 'var(--divider)' }}>
              {user.user_metadata?.role || 'user'}
            </span>
            <button onClick={handleSignOut} className="text-sm underline" style={{ color: 'var(--link)' }}>Sign out</button>
          </>
        ) : (
          <>
            <Link href="/auth/sign-in" className="underline mr-2" style={{ color: 'var(--link)' }}>Sign in</Link>
            <Link href="/auth/sign-up" className="underline" style={{ color: 'var(--link)' }}>Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
} 