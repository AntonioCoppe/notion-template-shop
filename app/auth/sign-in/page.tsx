"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase-browser";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = getBrowserSupabase();
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
    const role = data.user?.user_metadata?.role;
    router.push(role === "vendor" ? "/vendor" : "/dashboard");
  };

  return (
    <main className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold mb-4 text-center">Sign in</h1>
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
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-red-600 text-sm">{error}</p>
            {error.includes("confirmation") && (
              <p className="text-red-500 text-xs mt-1">
                Can&apos;t find the email? Check your spam folder or{" "}
                <Link href="/auth/sign-up" className="underline">
                  sign up again
                </Link>
              </p>
            )}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`bg-black text-white px-4 py-2 rounded w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="text-center text-sm mt-4">
        Don&apos;t have an account?{' '}
        <Link href="/auth/sign-up" className="underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
