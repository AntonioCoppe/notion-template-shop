"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const completeProfile = async () => {
      if (status === "authenticated" && session?.user) {
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
            body: JSON.stringify({ role, email: session.user.email }),
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
      } else if (status === "unauthenticated") {
        // If not authenticated, redirect to sign-in
        router.push("/auth/sign-in");
      }
    };

    completeProfile();
  }, [session, status, router, searchParams]);

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



