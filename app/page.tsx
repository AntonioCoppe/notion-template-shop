"use client";

import TemplateCard from "./template-card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

interface Template {
  id: string;
  title: string;
  price: number;
  priceId: string;
  img: string;
  description: string;
  notionUrl: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = getBrowserSupabase();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/templates");
        if (!response.ok) {
          throw new Error("Failed to fetch templates");
        }
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error("Error fetching templates:", error);
        // Fallback to empty array if API fails
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="flex justify-end gap-4 mb-8 items-center">
        {/* Auth buttons moved to Navbar */}
      </header>
      <h1 className="text-4xl font-bold mb-8 text-center">
        Notion Template Shop
      </h1>
      {loading ? (
        <div className="text-center py-8">Loading templates...</div>
      ) : templates.length > 0 ? (
        <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
          {templates.map((t) => (
            <TemplateCard key={t.id} {...t} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No templates available yet.</p>
          <p className="text-sm text-gray-500">
            Vendors can add templates by signing up and connecting their Stripe account.
          </p>
          {user?.user_metadata?.role === "vendor" && (
            <div className="mt-4">
              <Link
                href="/vendor"
                className="btn-primary"
              >
                Go to Vendor Dashboard
              </Link>
            </div>
          )}
        </div>
      )}
    </main>
  );
}