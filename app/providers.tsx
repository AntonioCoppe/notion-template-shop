"use client";

import SupabaseProvider from "@/lib/session-provider";
import { useSupabaseAuth } from "@/lib/useSupabaseAuth";

function AuthHandler({ children }: { children: React.ReactNode }) {
  useSupabaseAuth();
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <AuthHandler>
        {children}
      </AuthHandler>
    </SupabaseProvider>
  );
} 