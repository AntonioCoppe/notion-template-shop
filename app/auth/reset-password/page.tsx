"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check if we have a valid session for password reset
    const checkSession = async () => {
      const supabase = getBrowserSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("Invalid or expired reset link. Please request a new password reset.");
        return;
      }
      
      setIsValidSession(true);
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    const supabase = getBrowserSupabase();
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (!isValidSession && error) {
    return (
      <main className="max-w-md mx-auto px-4 py-20">
        <h1 className="text-2xl font-bold mb-4 text-center">Reset Password</h1>
        <div className="bg-red-50 border border-red-200 rounded p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link 
            href="/auth/forgot-password" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Request new reset link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold mb-4 text-center">Reset Password</h1>
      
      {success ? (
        <div className="bg-green-50 border border-green-200 rounded p-6 text-center">
          <h2 className="text-lg font-semibold text-green-800 mb-2">Password updated successfully!</h2>
          <p className="text-green-700 mb-4">
            Your password has been reset. You can now sign in with your new password.
          </p>
          <Link 
            href="/auth/sign-in" 
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Sign in
          </Link>
        </div>
      ) : (
        <>
          <p className="text-center text-gray-600 mb-6">
            Enter your new password below.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="New password"
              className="border px-3 py-2 rounded w-full text-black"
              autoComplete="new-password"
              minLength={6}
            />
            
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
              className="border px-3 py-2 rounded w-full text-black"
              autoComplete="new-password"
              minLength={6}
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
              {loading ? "Updating..." : "Update password"}
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