"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const onHome = pathname === "/";

  const handleSectionClick =
    (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onHome) {
        const element = document.getElementById(id);
        if (element) {
          e.preventDefault();
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
      setMobileMenuOpen(false);
    };

  const linkClass =
    "px-4 py-2 text-sm font-medium text-[#06121f]/80 hover:text-[#22d3ee] transition-colors";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0b111c]/70 backdrop-blur-xl">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/#hero"
            onClick={handleSectionClick("hero")}
            className="flex items-center gap-3 group"
          >
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[#4f8cff] to-[#22d3ee] text-[#06121f] font-display font-extrabold text-lg shadow-[0_8px_24px_-8px_rgba(207,132,32,0.7)] group-hover:scale-105 transition-transform">
              S
            </span>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-lg text-[#ffffff] tracking-tight">
                SPARC
              </span>
              <span className="text-[10px] text-[#22d3ee] uppercase tracking-[0.2em] mt-1">
                Student Club
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/#hero" onClick={handleSectionClick("hero")} className={linkClass}>
              Home
            </Link>
            <Link href="/#about" onClick={handleSectionClick("about")} className={linkClass}>
              About
            </Link>
            <Link
              href="/games"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(linkClass, "text-[#22d3ee] hover:text-[#67e8f9]")}
            >
              ▶ Arcade
            </Link>
            <Link
              href="/#about"
              onClick={handleSectionClick("about")}
              className="neo-btn neo-btn-primary ml-2 px-5 py-2.5 text-sm"
            >
              Join Us
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#06121f] hover:text-[#22d3ee] hover:bg-white/5 transition-colors"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-white/10 mt-1 pt-4">
            <nav className="flex flex-col gap-1">
              <Link href="/#hero" onClick={handleSectionClick("hero")} className={linkClass}>
                Home
              </Link>
              <Link href="/#about" onClick={handleSectionClick("about")} className={linkClass}>
                About
              </Link>
              <Link
                href="/games"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(linkClass, "text-[#22d3ee]")}
              >
                ▶ Arcade
              </Link>
              <Link
                href="/#about"
                onClick={handleSectionClick("about")}
                className="neo-btn neo-btn-primary mt-2 mx-4 px-5 py-3 text-sm"
              >
                Join Us
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
