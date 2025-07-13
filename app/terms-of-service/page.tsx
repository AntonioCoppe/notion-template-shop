import Link from "next/link";

export default function TermsOfService() {
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