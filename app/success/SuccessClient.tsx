"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface Template {
  id: string;
  title: string;
}

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      router.replace("/");
      return;
    }

    async function fetchTemplates(templateIds: string[]): Promise<void> {
      setLoading(true);
      try {
        const res = await fetch(`/api/templates/by-ids?ids=${templateIds.join(',')}`);
        if (!res.ok) throw new Error("Failed to fetch templates");
        const data = await res.json();
        setTemplates(data || []);
      } catch (e: unknown) {
        console.error("Failed to fetch templates:", e);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    }

    async function fetchSessionAndTemplates(): Promise<void> {
      try {
        const sessionRes = await fetch(`/api/stripe/checkout-session?session_id=${sessionId}`);
        if (!sessionRes.ok) throw new Error("Failed to fetch session");
        const session = await sessionRes.json();
        const templateIds = session.metadata?.template_ids?.split(',');
        if (templateIds && templateIds.length > 0) {
          await fetchTemplates(templateIds);
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }

    fetchSessionAndTemplates();
  }, [sessionId, router]);

  return (
    <main className="max-w-xl mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold mb-6">Thanks for your purchase! 🎉</h1>
      {loading ? (
        <p>Retrieving your order…</p>
      ) : templates.length > 0 ? (
        <>
          <p className="mb-4">
            You bought the following templates. You will also receive an email with the links.
          </p>
          <ul className="text-left mb-6 bg-gray-50 p-4 rounded-lg space-y-2">
            {templates.map((template) => (
              <li key={template.id} className="font-semibold">
                - {template.title}
              </li>
            ))}
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
        <p>Could not find your order details.</p>
      )}
    </main>
  );
} 