"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
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
        <button
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 ml-auto mr-2"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={`block w-6 h-0.5 bg-current mb-1 transition-transform ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-current mb-1 transition-opacity ${menuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
          <span className={`block w-6 h-0.5 bg-current transition-transform ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
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
      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg z-50 w-full">
          <div className="flex flex-col gap-2 py-2 px-4">
            <Link href="/">Home Page</Link>
            <Link href="/templates">Templates</Link>
            <Link href="#">Pricing</Link>
            <Link href="#">Resources ▼</Link>
            <div className="flex gap-2 mt-2">
              <Link href="/auth/sign-up" className="btn-secondary flex-1 text-center">Join</Link>
              <Link href="/auth/sign-in" className="btn-primary flex-1 text-center">Learn</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 