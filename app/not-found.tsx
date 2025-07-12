import Link from "next/link";

export default function NotFound() {
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
      <main style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "2rem" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: 700, color: "var(--primary-purple)" }}>404</h1>
        <h2 style={{ fontSize: "1.5rem", color: "var(--foreground)" }}>Page Not Found</h2>
        <p style={{ color: "var(--foreground)", maxWidth: 400 }}>
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="btn-primary" style={{ textDecoration: "none" }}>
          Go back home
        </Link>
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