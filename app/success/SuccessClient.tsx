"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Stripe from "stripe";

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [lineItems, setLineItems] = useState<Stripe.LineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      router.replace("/");
      return;
    }

    async function fetchSession(): Promise<void> {
      setLoading(true);
      try {
        const res = await fetch(`/api/stripe/session?session_id=${sessionId}`);
        if (!res.ok) throw new Error("Failed to fetch session");
        interface SessionResponse {
          lineItems: Stripe.LineItem[];
        }
        const data = (await res.json()) as SessionResponse;
        setLineItems(data.lineItems || []);
      } catch (e: unknown) {
        console.error("Failed to fetch session:", e);
        setLineItems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [sessionId, router]);

  return (
    <main className="max-w-xl mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold mb-6">Thanks for your purchase! 🎉</h1>
      {loading ? (
        <p>Retrieving your order…</p>
      ) : lineItems.length > 0 ? (
        <>
          <p className="mb-4">
            You bought the following templates. You will also receive an email with the links.
          </p>
          <ul className="text-left mb-6 bg-gray-50 p-4 rounded-lg space-y-2">
            {lineItems.map((item: Stripe.LineItem) => {
              const product = item.price?.product as Stripe.Product | undefined;
              return (
                <li key={product?.id || item.id} className="font-semibold">
                  - {product?.name || 'A template'}
                </li>
              );
            })}
          </ul>
          <p className="mb-4">
            Lost it later? Enter your email on the{' '}
            <Link href="/account" className="underline text-blue-600">
              account page
            </Link>{' '}
            to view all purchases.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 underline text-blue-600 hover:text-blue-700"
          >
            Back to templates
          </Link>
        </>
      ) : (
        <p>Could not find your order.</p>
      )}
    </main>
  );
} 