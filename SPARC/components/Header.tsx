"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        "bg-white/95 backdrop-blur-md border-b border-club-main/10 shadow-sm"
      )}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => scrollToSection("hero")}
            className="flex items-center gap-3 group"
          >
            <div className="flex flex-col transition-colors duration-300 text-foreground">
              <span className="text-xl font-bold tracking-tight">SPARC</span>
              <span className="text-[10px] text-club-orange uppercase tracking-wider font-semibold">Student Club</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => scrollToSection("hero")}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-foreground/80 hover:text-[#C02026] hover:bg-[#CF8420]/10"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-foreground/80 hover:text-[#C02026] hover:bg-[#CF8420]/10"
            >
              About
            </button>
            <Link
              href="/games"
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-foreground/80 hover:text-[#C02026] hover:bg-[#CF8420]/10"
            >
              Games
            </Link>
            <button
              onClick={() => scrollToSection("about")}
              className={cn(
                "ml-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all",
                "bg-[#CF8420] hover:bg-[#CF8420]/90 text-white",
                "hover:scale-105 active:scale-95"
              )}
            >
              Join Us
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors text-foreground hover:bg-[#CF8420]/10 hover:text-[#C02026]"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-club-main/20 mt-4 pt-4">
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => scrollToSection("hero")}
                className="text-left px-4 py-2 text-sm font-medium text-foreground/70 hover:text-[#C02026] hover:bg-[#CF8420]/10 rounded-lg transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-left px-4 py-2 text-sm font-medium text-foreground/70 hover:text-[#C02026] hover:bg-[#CF8420]/10 rounded-lg transition-colors"
              >
                About
              </button>
              <Link
                href="/games"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left px-4 py-2 text-sm font-medium text-foreground/70 hover:text-[#C02026] hover:bg-[#CF8420]/10 rounded-lg transition-colors"
              >
                Games
              </Link>
              <button
                onClick={() => scrollToSection("about")}
                className="mt-2 mx-4 px-5 py-2.5 text-sm font-semibold bg-[#CF8420] hover:bg-[#CF8420]/90 text-white rounded-lg transition-colors"
              >
                Join Us
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
