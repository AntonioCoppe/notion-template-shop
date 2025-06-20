"use client";

import { useState } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "vendor">("buyer");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

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
      const supabase = getBrowserSupabase();
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
      <main className="max-w-md mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Check your email</h1>
          <p className="text-gray-600 mb-6">
            We’ve sent a confirmation link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Click the link in your email to confirm your account and start using the platform.
          </p>
          <div className="space-y-3">
            <Link
              href="/auth/sign-in"
              className="block bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
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
    <main className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold mb-4 text-center">Sign up</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Email"
          className="border px-3 py-2 rounded w-full text-black"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Password"
          className="border px-3 py-2 rounded w-full text-black"
        />
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-1">
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
          <label className="flex items-center gap-1">
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
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className={`bg-black text-white px-4 py-2 rounded w-full ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Signing up…" : "Sign up"}
        </button>
      </form>
      <p className="text-center text-sm mt-4">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
