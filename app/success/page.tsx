import Stripe from "stripe";
import { redirect } from "next/navigation";
import Link from "next/link";

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

  return (
    <main className="max-w-xl mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold mb-6">Thanks for your purchase! 🎉</h1>
      {product ? (
        <>
          <p className="mb-4">
            You bought <strong>{product.name}</strong>. A copy link is on its
            way to your inbox.
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
