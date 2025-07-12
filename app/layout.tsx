import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SupabaseProvider from "@/lib/session-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Notion Templates Shop",
  description: "Premium Notion templates for productivity and organization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.svg" type="image/png" />
        <title>Notion Templates Shop</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SupabaseProvider>
          {/* Header */}
          <header className="container w-full flex flex-wrap items-center justify-between py-4 px-2 md:px-0">
            <Link href="#" className="logo flex-shrink-0">
              <span className="logo-icon">
                <span className="grid-cell"></span>
                <span className="grid-cell"></span>
                <span className="grid-cell"></span>
                <span className="grid-cell"></span>
              </span>
              <span className="logo-text">Notion Template Shop</span>
            </Link>
            <button className="md:hidden flex flex-col justify-center items-center w-8 h-8 ml-auto mr-2" aria-label="Toggle menu">
              <span className="block w-6 h-0.5 bg-current mb-1 transition-transform "></span>
              <span className="block w-6 h-0.5 bg-current mb-1 transition-opacity opacity-100"></span>
              <span className="block w-6 h-0.5 bg-current transition-transform "></span>
            </button>
            <nav className="hidden md:flex gap-6 items-center flex-wrap ml-4">
              <Link href="/">Home Page</Link>
              <Link href="/templates">Templates</Link>
              <Link href="#">Pricing</Link>
              <Link href="#">Resources ▼</Link>
            </nav>
            <div className="hidden md:flex buttons gap-2 ml-4">
              <Link className="btn-secondary" href="/auth/sign-up">Join</Link>
              <Link className="btn-primary" href="/auth/sign-in">Learn</Link>
            </div>
          </header>
          {children}
          {/* Footer */}
          <footer className="w-full px-2 mt-12">
            <div className="container footer-top flex flex-col md:flex-row items-center justify-between gap-4">
              <a href="#" className="logo">
                <span className="logo-icon">
                  <span className="grid-cell"></span>
                  <span className="grid-cell"></span>
                  <span className="grid-cell"></span>
                  <span className="grid-cell"></span>
                </span>
                <span className="logo-text">Notion Template Shop</span>
              </a>
              <nav className="footer-nav flex flex-wrap gap-2 md:gap-6">
                <Link href="/">Home</Link>
                <Link href="/templates">Templates</Link>
                <Link href="#">Pricing</Link>
                <Link href="#">Resources</Link>
              </nav>
              <div className="footer-social flex gap-2">
                <a href="#" aria-label="Twitter">🐦</a>
                <a href="#" aria-label="LinkedIn">💼</a>
                <a href="#" aria-label="Instagram">📸</a>
              </div>
            </div>
            <div className="container footer-bottom flex flex-col md:flex-row items-center justify-between gap-2 mt-4">
              <div>© 2025 Antonio Coppe. All rights reserved.</div>
              <div className="footer-nav flex flex-wrap gap-2 md:gap-6">
                <Link href="/support" className="hover:underline">Customer Support</Link>
                <span className="hidden md:inline">|</span>
                <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
                <span className="hidden md:inline">|</span>
                <Link href="/terms-of-service" className="hover:underline">Terms of Service</Link>
              </div>
            </div>
          </footer>
        </SupabaseProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
