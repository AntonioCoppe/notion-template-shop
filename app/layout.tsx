import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Navbar from "./Navbar";
import SupabaseProvider from "@/lib/session-provider";

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
        <link rel="icon" href="/logo-icon.png" type="image/png" />
        <title>Notion Templates Shop</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SupabaseProvider>
          <header style={{
            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem 2rem',
            background: 'var(--white)', borderBottom: '1px solid var(--divider)', marginBottom: '2rem'
          }}>
            <Image src="/logo.png" alt="Notion Templates Shop Logo" width={64} height={64} priority />
            <span style={{
              fontSize: '2rem', fontWeight: 700, color: 'var(--primary-purple)', letterSpacing: '-1px',
              fontFamily: 'inherit',
            }}>
              Notion Templates Shop
            </span>
          </header>
          <Navbar />
          {children}
          <footer className="w-full border-t border-gray-200 mt-12 py-6 bg-white">
            <div className="max-w-2xl mx-auto flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-gray-600">
              <a href="/support" className="hover:underline">Customer Support</a>
              <span className="hidden md:inline">|</span>
              <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
              <span className="hidden md:inline">|</span>
              <a href="/terms-of-service" className="hover:underline">Terms of Service</a>
            </div>
          </footer>
        </SupabaseProvider>
      </body>
    </html>
  );
}
