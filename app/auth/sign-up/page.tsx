"use client";

import { useState } from "react";
import Link from "next/link";
import { useSupabase } from "@/lib/session-provider";
import Image from "next/image";

export default function SignUp() {
  const { supabase } = useSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "vendor">("buyer");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleRoleAndSignIn = async (selectedRole: 'buyer' | 'vendor') => {
    // Use Supabase's OAuth flow with role in state
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/complete-profile?role=${selectedRole}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) {
      console.error('OAuth error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      // parse JSON (no more HTML 404)
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Signup failed");
      } else {
        setShowConfirmation(true);
      }
    } catch (err) {
      console.error("Fetch /api/auth/sign-up error:", err);
      setError("Unexpected network error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) {
        setError(error.message);
      } else {
        alert("Confirmation email sent! Please check your inbox and spam folder.");
      }
    } catch (err) {
      console.error("Resend confirmation error:", err);
      setError("Failed to resend email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  if (showConfirmation) {
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
          <h1 className="text-2xl font-bold mb-4">Check your email</h1>
          <p className="text-gray-600 mb-6">
            We&apos;ve sent a confirmation link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Click the link in your email to confirm your account and start using the platform.
          </p>
          <div className="space-y-3 w-full">
            <Link
              href="/auth/sign-in"
              className="block btn-primary w-full text-center"
            >
              Go to Sign In
            </Link>
            <button
              onClick={handleResendEmail}
              disabled={resendLoading}
              className={`block w-full text-sm underline text-gray-600 hover:text-gray-800 ${
                resendLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {resendLoading ? "Sending..." : "Resend confirmation email"}
            </button>
            <button
              onClick={() => setShowConfirmation(false)}
              className="block w-full text-sm underline text-gray-600 hover:text-gray-800"
            >
              Back to Sign Up
            </button>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>
        </div>
      </main>
    );
  }

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
        <h1 className="text-2xl font-bold mb-4 text-center">Sign up</h1>
        <div className="social-buttons w-full flex flex-col gap-3 mb-6">
          <div className="flex gap-4 items-center justify-center mb-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="buyer"
                checked={role === "buyer"}
                onChange={() => setRole("buyer")}
                className="accent-black"
              />
              Buyer
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="vendor"
                checked={role === "vendor"}
                onChange={() => setRole("vendor")}
                className="accent-black"
              />
              Vendor
            </label>
          </div>
          <button
            type="button"
            onClick={() => handleRoleAndSignIn(role)}
            className="flex items-center justify-center gap-2 border border-gray-300 rounded px-4 py-2 bg-white hover:bg-gray-50"
          >
            <Image src="/Google__G__logo.svg.png" alt="Google logo" width={20} height={20} />
            Sign up with Google
          </button>
        </div>
        <div className="flex items-center w-full mb-6">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="mx-4 text-gray-400 font-medium">or</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>
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
            autoComplete="new-password"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`btn-primary w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Signing up" : "Sign up"}
          </button>
        </form>
        <p className="text-center text-sm mt-6">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
