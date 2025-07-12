"use client";

import { SessionProvider } from "next-auth/react";
import SupabaseProvider from "@/lib/session-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SupabaseProvider>
        {children}
      </SupabaseProvider>
    </SessionProvider>
  );
} 