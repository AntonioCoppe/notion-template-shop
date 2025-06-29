"use client";

import { useState } from "react";
import Link from "next/link";
import { useSupabase } from "@/lib/session-provider";

export default function ForgotPassword() {
  const { supabase } = useSupabase();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <main className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold mb-4 text-center">Forgot Password</h1>
      
      {success ? (
        <div className="bg-green-50 border border-green-200 rounded p-6 text-center">
          <h2 className="text-lg font-semibold text-green-800 mb-2">Check your email</h2>
          <p className="text-green-700 mb-4">
            We&apos;ve sent a password reset link to <strong>{email}</strong>
          </p>
          <div className="text-green-600 text-sm space-y-2">
            <p>Can&apos;t find the email? Try these steps:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Check your spam/junk folder</li>
              <li>Wait a few minutes - emails can take time to arrive</li>
              <li>Make sure you used the correct email address</li>
            </ul>
          </div>
          <Link 
            href="/auth/sign-in" 
            className="inline-block mt-4 text-green-700 underline hover:text-green-800"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <p className="text-center text-gray-600 mb-6">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
              className="border px-3 py-2 rounded w-full text-black"
              autoComplete="email"
            />
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
          
          <p className="text-center text-sm mt-4">
            Remember your password?{' '}
            <Link href="/auth/sign-in" className="underline">
              Sign in
            </Link>
          </p>
        </>
      )}
    </main>
  );
} 