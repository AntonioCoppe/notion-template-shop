import Link from "next/link";

export default function Support() {
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
        <div className="buttons">
          <Link href="/auth/sign-up" className="btn-secondary">Join</Link>
          <Link href="/auth/sign-in" className="btn-primary">Learn</Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Customer Support</h1>
        <p className="mb-4">If you have any questions, issues, or need help, please email us at <a href="mailto:support@notiontemplateshop.com" className="underline text-blue-600">support@notiontemplateshop.com</a>.</p>
        <p>We aim to respond within 24-48 hours.</p>
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