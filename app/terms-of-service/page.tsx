import Link from "next/link";

export default function TermsOfService() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4">Welcome to Notion Template Shop. By using our website and services, you agree to the following terms:</p>
      <ul className="list-disc ml-6 mb-4">
        <li>You must be at least 18 years old or have parental consent to use this site.</li>
        <li>All templates are for personal use unless otherwise stated. Redistribution or resale is prohibited.</li>
        <li>Payments are processed securely via Stripe. All sales are final unless otherwise specified.</li>
        <li>We reserve the right to update these terms at any time. Continued use of the site constitutes acceptance of the new terms.</li>
      </ul>
      <p className="mt-8">For questions, please visit <Link href="/support" className="underline text-blue-600">our support page</Link>.</p>
    </main>
  );
} 