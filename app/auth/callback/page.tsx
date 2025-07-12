"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/lib/session-provider";

export default function AuthCallback() {
  const router = useRouter();
  const { user, loading } = useSupabase();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // No user, redirect to sign-in
        router.push("/auth/sign-in");
        return;
      }

      // Check if user has a role set
      const userRole = user.user_metadata?.role;
      
      if (!userRole) {
        // User doesn't have a role, redirect to role selection
        router.push("/auth/choose-role");
      } else {
        // User has a role, redirect to appropriate dashboard
        router.push(userRole === "vendor" ? "/vendor" : "/dashboard");
      }
    }
  }, [user, loading, router]);

  // Show loading state while checking
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p>Setting up your account...</p>
      </div>
    </div>
  );
} 