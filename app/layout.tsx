import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Link from "next/link";
import Header from "./Header";

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
        <Providers>
          <Header />
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
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
