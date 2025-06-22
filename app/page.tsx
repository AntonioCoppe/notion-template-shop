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
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 12;

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
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        params.append("page", page.toString());
        params.append("perPage", perPage.toString());
        const url = `/api/templates?${params.toString()}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch templates");
        }
        const result = await response.json();
        setTemplates(result.data);
        setTotal(result.total);
      } catch (error) {
        console.error("Error fetching templates:", error);
        setTemplates([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [search, minPrice, maxPrice, page]);

  const totalPages = Math.ceil(total / perPage);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="flex justify-end gap-4 mb-8 items-center">
        {/* Auth buttons moved to Navbar */}
      </header>
      <h1 className="text-4xl font-bold mb-8 text-center">
        Notion Template Shop
      </h1>
      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="border px-3 py-2 rounded w-full md:w-1/3 text-black"
        />
        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Min Price"
            value={minPrice}
            onChange={e => { setMinPrice(e.target.value); setPage(1); }}
            className="border px-3 py-2 rounded text-black w-24"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Max Price"
            value={maxPrice}
            onChange={e => { setMaxPrice(e.target.value); setPage(1); }}
            className="border px-3 py-2 rounded text-black w-24"
          />
        </div>
      </div>
      {/* End Filter Controls */}
      {loading ? (
        <div className="text-center py-8">Loading templates...</div>
      ) : templates.length > 0 ? (
        <>
          <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
            {templates.map((t) => (
              <TemplateCard key={t.id} {...t} />
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              className="px-3 py-1 rounded border disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={!canPrev}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages || 1}
            </span>
            <button
              className="px-3 py-1 rounded border disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={!canNext}
            >
              Next
            </button>
          </div>
        </>
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