"use client";

import Link from "next/link";
import { games } from "@/lib/games";

export default function GamesSection() {
  const teasers = games.slice(0, 5);
  const hasGames = teasers.length > 0;

  return (
    <section id="games" className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[560px] max-h-[560px] rounded-full bg-[#22d3ee]/6 blur-[130px] -z-0" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-14 space-y-4">
          <span className="neo-chip px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]">
            ★ Game Zone
          </span>
          <h2 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight">
            The <span className="grad-text text-glow">Arcade</span>
          </h2>
          <p className="text-lg md:text-xl text-[#ffffff]/70 max-w-2xl mx-auto">
            Take a break and challenge yourself — robotics-brain games and retro
            classics, all in the browser.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {hasGames
            ? teasers.map((game) => (
                <Link
                  key={game.slug}
                  href="/games"
                  className="neo-card p-7 group flex flex-col"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 origin-left">
                    {game.emoji}
                  </div>
                  <h3 className="font-display font-bold text-xl text-[#ffffff] mb-2">
                    {game.title}
                  </h3>
                  <p className="text-sm text-[#ffffff]/60 leading-relaxed flex-1">
                    {game.description}
                  </p>
                  <span className="mt-4 text-sm font-semibold text-[#22d3ee] group-hover:translate-x-1 transition-transform">
                    ▶ Play now
                  </span>
                </Link>
              ))
            : [0, 1, 2].map((i) => (
                <div key={i} className="neo-card p-7 text-center opacity-60">
                  <div className="text-5xl mb-4">🎮</div>
                  <h3 className="font-display font-bold text-[#ffffff]/70">Coming Soon</h3>
                </div>
              ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/games" className="neo-btn neo-btn-primary px-8 py-4 text-base md:text-lg">
            ▶ Enter the Arcade
          </Link>
        </div>
      </div>
    </section>
  );
}
