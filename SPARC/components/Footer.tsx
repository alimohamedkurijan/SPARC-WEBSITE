"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const currentYear = new Date().getFullYear();

  const handleSectionClick =
    (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onHome) {
        const element = document.getElementById(id);
        if (element) {
          e.preventDefault();
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

  const linkClass =
    "text-sm text-[#06121f]/60 hover:text-[#22d3ee] transition-colors";

  return (
    <footer className="border-t border-white/10 bg-[#0b111c]/60">
      <div className="container mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Logo and Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[#4f8cff] to-[#22d3ee] text-[#06121f] font-display font-extrabold text-lg">
                S
              </span>
              <div>
                <h3 className="font-display font-bold text-lg text-[#ffffff]">SPARC</h3>
                <p className="text-[10px] text-[#22d3ee] uppercase tracking-[0.2em] mt-1">
                  Student Club
                </p>
              </div>
            </div>
            <p className="text-[#ffffff]/60 max-w-md leading-relaxed">
              A student club dedicated to robotics, programming, innovation — and
              a little friendly arcade competition.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-sm text-[#22d3ee] uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/#hero" onClick={handleSectionClick("hero")} className={linkClass}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#about" onClick={handleSectionClick("about")} className={linkClass}>
                  About
                </Link>
              </li>
              <li>
                <Link href="/games" className={linkClass}>
                  Arcade
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-sm text-[#22d3ee] uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-[#ffffff]/60">
              <li>contact@sparc.club</li>
              <li>University Campus</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-[#ffffff]/50">
            © {currentYear} SPARC Student Club · Built with code &amp; caffeine.
          </p>
        </div>
      </div>
    </footer>
  );
}
