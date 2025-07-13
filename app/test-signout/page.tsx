"use client";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function TestSignOut() {
  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        console.log("Test sign out clicked");
        const session = await supabase.auth.getSession();
        console.log("Current session:", session);
        const result = await supabase.auth.signOut();
        console.log("Test sign out result:", result);
        router.push("/auth/sign-in");
      }}
      style={{ padding: 16, fontSize: 18, margin: 32 }}
    >
      Test Sign Out
    </button>
  );
} 