"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { useSupabase } from "@/lib/session-provider";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, loading } = useSupabaseUser();
  const { supabase } = useSupabase();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleFullSignOut = useCallback(async () => {
    // Dynamically import next-auth signOut to avoid SSR issues
    const { signOut: nextAuthSignOut } = await import("next-auth/react");
    console.log('▶️ NextAuth signOut');
    await nextAuthSignOut({ redirect: false });
    console.log('▶️ supabase-js signOut');
    await supabase.auth.signOut();
    console.log('▶️ delete server-side supabase cookie');
    await fetch('/api/supabase/session', { method: 'DELETE' });
    window.location.href = '/auth/sign-in';
  }, [supabase]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <>
      <header className="container w-full flex flex-wrap items-center justify-between py-4 px-2 md:px-0">
        <Link href="/" className="logo flex-shrink-0">
          <span className="logo-icon">
            <span className="grid-cell"></span>
            <span className="grid-cell"></span>
            <span className="grid-cell"></span>
            <span className="grid-cell"></span>
          </span>
          <span className="logo-text">Notion Template Shop</span>
        </Link>
        <button
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 ml-auto mr-2"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={`block w-6 h-0.5 bg-current mb-1 transition-transform ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-current mb-1 transition-opacity ${menuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
          <span className={`block w-6 h-0.5 bg-current transition-transform ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </button>
        <nav className="hidden md:flex gap-6 items-center flex-wrap ml-4">
          <Link href="/">Home Page</Link>
          <Link href="/templates">Templates</Link>
          <Link href="#">Pricing</Link>
          <Link href="#">Resources ▼</Link>
        </nav>
        <div className="hidden md:flex buttons gap-2 ml-4">
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
              <span className="text-sm text-gray-500">Loading...</span>
            </div>
          ) : (
            <>
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden lg:block text-sm">{user.email}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        <Link
                          href="/account"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Account
                        </Link>
                        {user.user_metadata?.role === 'vendor' && (
                          <Link
                            href="/vendor"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Vendor Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleFullSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link className="btn-secondary" href="/auth/sign-up">Join</Link>
                  <Link className="btn-primary" href="/auth/sign-in">Learn</Link>
                </>
              )}
            </>
          )}
        </div>
      </header>
      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg z-50 w-full">
          <div className="flex flex-col gap-2 py-2 px-4">
            <Link href="/">Home Page</Link>
            <Link href="/templates">Templates</Link>
            <Link href="#">Pricing</Link>
            <Link href="#">Resources ▼</Link>
            {loading ? (
              <div className="flex items-center gap-2 py-2 border-t border-gray-200 mt-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            ) : (
              <>
                {user ? (
                  <>
                    <div className="flex items-center gap-2 py-2 border-t border-gray-200 mt-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm text-gray-600">{user.email}</span>
                    </div>
                    <Link href="/account" className="btn-secondary text-center">Account</Link>
                    {user.user_metadata?.role === 'vendor' && (
                      <Link href="/vendor" className="btn-secondary text-center">Vendor Dashboard</Link>
                    )}
                    <button
                      onClick={handleFullSignOut}
                      className="btn-primary text-center"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 mt-2">
                    <Link href="/auth/sign-up" className="btn-secondary flex-1 text-center">Join</Link>
                    <Link href="/auth/sign-in" className="btn-primary flex-1 text-center">Learn</Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
} 