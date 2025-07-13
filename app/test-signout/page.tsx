"use client";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function TestSignOut() {
  const supabase = createClientComponentClient();
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