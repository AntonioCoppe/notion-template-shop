import { supabase } from "@/lib/supabase";
import templates from "@/app/templates";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Account({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = searchParams.email?.trim();

  if (!email) {
    return (
      <main className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Find your purchases</h1>
        <form className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            required
            className="border px-3 py-2 rounded w-full text-black"
          />
          <button type="submit" className="bg-black text-white px-4 py-2 rounded">
            View Orders
          </button>
        </form>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("orders")
    .select("template_id, created_at")
    .eq("email", email)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  const purchases = data?.map((o) => ({
    ...o,
    template: templates.find((t) => t.id === o.template_id),
  }));

  return (
    <main className="max-w-lg mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold mb-6 text-center">Your purchases</h1>
      {purchases && purchases.length > 0 ? (
        <ul className="space-y-4">
          {purchases.map(({ template, created_at }, idx) => (
            template && (
              <li key={idx} className="border p-4 rounded">
                <h2 className="font-semibold mb-2">{template.title}</h2>
                <a
                  href={template.notionUrl}
                  className="text-blue-600 underline"
                  target="_blank"
                >
                  Duplicate template
                </a>
                <p className="text-sm text-gray-500 mt-1">
                  Purchased {new Date(created_at).toLocaleDateString()}
                </p>
              </li>
            )
          ))}
        </ul>
      ) : (
        <p className="text-center">No purchases found for {email}.</p>
      )}
      <div className="mt-8 text-center">
        <Link href="/">Back to templates</Link>
      </div>
    </main>
  );
}
