"use client";

import Link from "next/link";
import { useSupabase } from "@/lib/session-provider";
import { useState, useCallback } from "react";
import { fullSignOut } from "@/lib/fullSignOut";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, loading, supabase } = useSupabase();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleFullSignOut = useCallback(async () => {
    console.log("Sign out clicked");
    const { error } = await fullSignOut(supabase);
    console.log("Sign out error:", error);
    if (error) {
      console.error("Error signing out:", error);
      return;
    }
    console.log("Redirecting to /auth/sign-in");
    router.push("/auth/sign-in");
  }, [supabase, router]);

  // Navigation links for reuse
  const navLinks = (
    <>
      <Link href="/" className="hover:underline block py-2 px-4 md:inline md:py-0 md:px-0">Home</Link>
      {!loading && user && user.user_metadata?.role === "buyer" && (
        <>
          <Link href="/cart" className="hover:underline block py-2 px-4 md:inline md:py-0 md:px-0">Cart</Link>
          <Link href="/account" className="hover:underline block py-2 px-4 md:inline md:py-0 md:px-0">Account</Link>
        </>
      )}
      {!loading && user && user.user_metadata?.role === "vendor" && (
        <Link href="/vendor" className="hover:underline block py-2 px-4 md:inline md:py-0 md:px-0">Vendor Dashboard</Link>
      )}
    </>
  );

  return (
    <nav className="w-full border-b mb-6 text-base font-medium" style={{ background: 'var(--background)', borderColor: 'var(--divider)', color: 'var(--foreground)' }}>
      <div className="max-w-5xl mx-auto flex justify-between items-center py-3 px-4">
        {/* Left: Logo or Home */}
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:underline font-bold text-lg">Home</Link>
        </div>
        {/* Hamburger for mobile */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 focus:outline-none"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={`block w-6 h-0.5 bg-current mb-1 transition-transform ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-current mb-1 transition-opacity ${menuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
          <span className={`block w-6 h-0.5 bg-current transition-transform ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </button>
        {/* Desktop nav */}
        <div className="hidden md:flex gap-8 items-center flex-1 justify-center">
          {navLinks}
        </div>
        {/* Right: Auth */}
        <div className="hidden md:flex items-center gap-2">
          {!loading && user ? (
            <>
              <span className="mr-2 text-sm" style={{ color: 'var(--foreground)' }}>{user.email}</span>
              <span className="mr-2 text-xs px-2 py-1 rounded" style={{ color: 'var(--foreground)', background: 'var(--divider)' }}>
                {user.user_metadata?.role || 'user'}
              </span>
              <button onClick={handleFullSignOut} className="text-sm underline" style={{ color: 'var(--link)' }}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/auth/sign-in" className="underline mr-2" style={{ color: 'var(--link)' }}>Sign in</Link>
              <Link href="/auth/sign-up" className="underline" style={{ color: 'var(--link)' }}>Sign up</Link>
            </>
          )}
        </div>
      </div>
      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg z-50 absolute left-0 right-0">
          <div className="flex flex-col gap-2 py-2 px-4">
            {navLinks}
            <div className="border-t border-gray-100 my-2" />
            {!loading && user ? (
              <>
                <span className="text-sm mb-1" style={{ color: 'var(--foreground)' }}>{user.email}</span>
                <span className="text-xs px-2 py-1 rounded mb-2" style={{ color: 'var(--foreground)', background: 'var(--divider)' }}>
                  {user.user_metadata?.role || 'user'}
                </span>
                <button onClick={handleFullSignOut} className="text-sm underline text-left" style={{ color: 'var(--link)' }}>Sign out</button>
              </>
            ) : (
              <>
                <Link href="/auth/sign-in" className="underline mb-1" style={{ color: 'var(--link)' }}>Sign in</Link>
                <Link href="/auth/sign-up" className="underline" style={{ color: 'var(--link)' }}>Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 