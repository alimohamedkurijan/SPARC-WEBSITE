"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { games } from "@/lib/games";

export default function GamesSection() {
  // Show up to 3 games as a teaser; if none are added yet, show placeholders.
  const teasers = games.slice(0, 3);
  const hasGames = teasers.length > 0;

  return (
    <section id="games" className="relative py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-[#CF8420]/10 text-[#CF8420]">
            Game Zone
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Play &amp; Learn
          </h2>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
            Take a break and challenge yourself with our collection of interactive games.
          </p>
        </div>

        {/* Teaser Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {hasGames
            ? teasers.map((game) => (
                <div
                  key={game.slug}
                  className={cn(
                    "group text-center p-8 rounded-xl bg-white",
                    "border-2 border-[#C02026]/15 hover:border-[#CF8420]",
                    "shadow-md hover:shadow-xl transition-all duration-300"
                  )}
                >
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                    {game.emoji}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {game.title}
                  </h3>
                  <p className="text-sm text-foreground/60">{game.description}</p>
                </div>
              ))
            : [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "text-center p-8 rounded-xl bg-[#D9D9D9]/40",
                    "border-2 border-dashed border-[#C02026]/20"
                  )}
                >
                  <div className="text-6xl mb-4 opacity-40">🎮</div>
                  <h3 className="text-xl font-bold text-foreground/70 mb-2">
                    Coming Soon
                  </h3>
                  <p className="text-sm text-foreground/50">
                    New games are on the way.
                  </p>
                </div>
              ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            asChild
            className={cn(
              "px-8 py-6 text-base font-semibold rounded-lg",
              "bg-[#CF8420] hover:bg-[#CF8420]/90 text-white",
              "hover:scale-105 active:scale-95 transition-all"
            )}
          >
            <Link href="/games">Go to Game Zone</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
