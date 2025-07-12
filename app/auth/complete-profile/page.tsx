"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabase } from "@/lib/session-provider";
import { validateAndRefreshSession } from "@/lib/auth-utils";

function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, supabase } = useSupabase();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const completeProfile = async () => {
      if (!loading && user) {
        // Validate session is fresh before proceeding
        try {
          await validateAndRefreshSession(supabase);
        } catch (error) {
          console.error('Session validation error:', error)
          setError('Session validation failed. Please try signing in again.')
          return
        }

        const role = searchParams.get('role') as 'buyer' | 'vendor';
        
        if (!role || (role !== 'buyer' && role !== 'vendor')) {
          setError('Invalid role selected');
          return;
        }

        setSaving(true);
        setError(null);

        try {
          // Save the role to the database
          const res = await fetch("/api/auth/set-role", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role, email: user.email }),
            credentials: "include",
          });

          const json = await res.json();
          
          if (!res.ok) {
            setError(json.error || "Failed to set role");
            setSaving(false);
            return;
          }

          // Redirect to appropriate dashboard
          router.push(role === "vendor" ? "/vendor" : "/dashboard");
        } catch (err) {
          console.error("Error completing profile:", err);
          setError("Unexpected error occurred");
          setSaving(false);
        }
      } else if (!loading && !user) {
        // If not authenticated, redirect to sign-in
        router.push("/auth/sign-in");
      }
    };

    completeProfile();
  }, [user, loading, router, searchParams, supabase]);

  // Show loading state while completing profile
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-lg mb-2">
          {saving ? "Setting up your account..." : "Completing your profile..."}
        </p>
        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}

export default function CompleteProfile() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-lg mb-2">Loading...</p>
        </div>
      </div>
    }>
      <CompleteProfileContent />
    </Suspense>
  );
} 



