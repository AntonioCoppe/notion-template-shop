"use client";

import TemplateCard from "./template-card";
import templates from "./templates";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = getBrowserSupabase();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="flex justify-end gap-4 mb-8 items-center">
        {user && user.user_metadata?.role === "buyer" && (
          <span className="mr-4 text-sm text-gray-700">Signed in as {user.email}</span>
        )}
        <Link href="/auth/sign-in" className="underline">
          Sign in
        </Link>
        <Link href="/auth/sign-up" className="underline">
          Sign up
        </Link>
      </header>
      <h1 className="text-4xl font-bold mb-8 text-center">
        Notion Template Shop
      </h1>
      <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
        {templates.map((t) => (
          <TemplateCard key={t.id} {...t} />
        ))}
      </div>
    </main>
  );
}