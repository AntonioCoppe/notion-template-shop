import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";

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
        {children}
      </body>
    </html>
  );
}
