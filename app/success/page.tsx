import Stripe from "stripe";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Success({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  if (!sessionId) redirect("/");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price.product"],
  });

  const line = session.line_items?.data[0];
  const product = line?.price?.product as Stripe.Product | undefined;
  const priceId = line?.price?.id;

  // Fetch template from database if we have a price ID
  let template = null;
  if (priceId) {
    try {
      const price = await stripe.prices.retrieve(priceId);
      const productId = price.product as string;
      const templateId = productId.replace('template_', '');

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (!error && data) {
        template = data;
      }
    } catch (error) {
      console.error("Error fetching template:", error);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold mb-6">Thanks for your purchase! 🎉</h1>
      {product ? (
        <>
          <p className="mb-4">
            You bought <strong>{product.name}</strong>. {" "}
            {template ? (
              <>
                <a href={template.notion_url} className="underline text-blue-600" target="_blank">
                  Duplicate your template
                </a>{" "}
                or find it in your inbox.
              </>
            ) : (
              "A copy link is on its way to your inbox."
            )}
          </p>
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
        <p>Retrieving your order…</p>
      )}
    </main>
  );
}
