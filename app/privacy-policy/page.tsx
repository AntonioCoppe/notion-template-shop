import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <>
      {/* Header */}
      <header className="container">
        <a href="#" className="logo">
          <span className="logo-icon">
            <span className="grid-cell"></span>
            <span className="grid-cell"></span>
            <span className="grid-cell"></span>
            <span className="grid-cell"></span>
          </span>
          <span className="logo-text">Notion Template Shop</span>
        </a>
        <nav>
          <Link href="/">Home Page</Link>
          <Link href="/templates">Templates</Link>
          <Link href="#">Pricing</Link>
          <Link href="#">Resources ▼</Link>
        </nav>
        <div className="hidden md:flex buttons">
          <Link href="/auth/sign-up" className="btn-secondary">Join</Link>
          <Link href="/auth/sign-in" className="btn-primary">Learn</Link>
        </div>
      </header>
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
      {/* Footer */}
      <footer>
        <div className="container footer-top">
          <a href="#" className="logo">
            <span className="logo-icon">
              <span className="grid-cell"></span>
              <span className="grid-cell"></span>
              <span className="grid-cell"></span>
              <span className="grid-cell"></span>
            </span>
            <span className="logo-text">Notion Template Shop</span>
          </a>
          <nav className="footer-nav">
            <Link href="/">Home</Link>
            <Link href="/templates">Templates</Link>
            <Link href="#">Pricing</Link>
            <Link href="#">Resources</Link>
          </nav>
          <div className="footer-social">
            <a href="#" aria-label="Twitter">🐦</a>
            <a href="#" aria-label="LinkedIn">💼</a>
            <a href="#" aria-label="Instagram">📸</a>
          </div>
        </div>
        <div className="container footer-bottom">
          <div>© 2025 Reulme. All rights reserved.</div>
          <div className="footer-nav">
            <Link href="/support" className="hover:underline">Customer Support</Link>
            <span className="hidden md:inline">|</span>
            <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
            <span className="hidden md:inline">|</span>
            <Link href="/terms-of-service" className="hover:underline">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </>
  );
} 