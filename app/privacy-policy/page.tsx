import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">At Notion Template Shop, we value your privacy. This Privacy Policy describes the information we collect, how we use it, to whom we may disclose it, and the security practices we follow to safeguard your information.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Email address and account information when you sign up or make a purchase.</li>
        <li>Payment information (processed securely via Stripe).</li>
        <li>Usage data (such as pages visited and actions taken).</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Purpose of Use</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>To provide and improve our services.</li>
        <li>To process transactions and send notifications.</li>
        <li>To ensure security and prevent fraud.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Disclosure</h2>
      <p className="mb-4">We do not sell your personal information. We may share information with trusted third parties (such as payment processors) only as necessary to provide our services or comply with legal obligations.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Security</h2>
      <p className="mb-4">We implement reasonable security measures to protect your information. However, no method of transmission over the Internet is 100% secure.</p>
      <p className="mt-8">If you have any questions, please contact us at <Link href="/support" className="underline text-blue-600">our support page</Link>.</p>
    </main>
  );
} 