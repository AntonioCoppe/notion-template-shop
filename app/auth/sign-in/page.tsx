"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSupabase } from "@/lib/session-provider";

export default function SignIn() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setError("Please check your email and click the confirmation link before signing in.");
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }
    if (data.session) {
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }),
        credentials: "include",
      });
    }

    const role = data.user?.user_metadata?.role;
    // If role is missing, force a session refresh and reload
    if (!role) {
      await supabase.auth.refreshSession();
      window.location.reload();
      return;
    }
    router.push(role === "vendor" ? "/vendor" : "/dashboard");
  };

  return (
    <main className="container min-h-screen flex flex-col items-center justify-center py-16">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
        <Link href="/" className="logo mb-8">
          <span className="logo-icon">
            <span className="grid-cell"></span>
            <span className="grid-cell"></span>
            <span className="grid-cell"></span>
            <span className="grid-cell"></span>
          </span>
          <span className="logo-text">Notion Template Shop</span>
        </Link>
        <h1 className="text-2xl font-bold mb-4 text-center">Sign in</h1>
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
            className="border px-3 py-2 rounded w-full text-black bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
            autoComplete="email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
            className="border px-3 py-2 rounded w-full text-black bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
            autoComplete="current-password"
          />
          <div className="text-right">
            <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-600 text-sm">{error}</p>
              {error.includes("confirmation") && (
                <div className="text-red-500 text-xs mt-2 space-y-1">
                  <p>Can&apos;t find the email? Try these steps:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>Check your spam/junk folder</li>
                    <li>Wait a few minutes - emails can take time to arrive</li>
                    <li>Make sure you used the correct email address</li>
                    <li>
                      <Link href="/auth/sign-up" className="underline">
                        Sign up again with a different email
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`btn-primary w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Signing in" : "Sign in"}
          </button>
        </form>
        <p className="text-center text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/sign-up" className="underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
