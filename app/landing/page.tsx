import Link from "next/link";

export const metadata = {
  title: 'Welcome - Notion Template Shop',
  description: 'Premium Notion templates for productivity and organization.',
};

export default function LandingPage() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6 px-4">
      <h1 className="text-4xl font-bold text-[var(--primary-purple)]">
        notiontemplateshop.com
      </h1>
      <h2 className="text-2xl font-semibold">Notion Template Shop</h2>
      <p className="max-w-md text-lg text-gray-700">
        Premium Notion templates designed to boost your productivity and organize your workflow.
      </p>
      <Link href="/" className="btn-primary">
        Browse Templates
      </Link>
    </main>
  );
}
