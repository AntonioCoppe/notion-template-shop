"use client";

import SupabaseProvider from "@/lib/session-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      {children}
    </SupabaseProvider>
  );
} 