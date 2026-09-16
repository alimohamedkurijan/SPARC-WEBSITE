"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { games, type Game } from "@/lib/games";

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  const ActiveComponent = activeGame?.component ?? null;

  return (
    <main className="min-h-screen relative">
      <Header />

      <section className="pt-32 pb-20 lg:pb-32 bg-white min-h-screen">
        <div className="container mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-[#CF8420]/10 text-[#CF8420]">
              Game Zone
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Play &amp; Learn
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Pick a game below and start playing. New games are added regularly.
            </p>
          </div>

          {games.length === 0 ? (
            /* Empty state */
            <div className="max-w-xl mx-auto text-center py-16">
              <div className="text-7xl mb-6">🎮</div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Games are on the way
              </h2>
              <p className="text-foreground/60 mb-8">
                We&apos;re building out the Game Zone. Check back soon to play!
              </p>
              <Button
                asChild
                variant="outline"
                className="border-[#C02026]/30 text-[#C02026] hover:bg-[#C02026]/5"
              >
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          ) : (
            /* Games grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {games.map((game) => {
                const playable = Boolean(game.component);
                return (
                  <button
                    key={game.slug}
                    type="button"
                    disabled={!playable}
                    onClick={() => playable && setActiveGame(game)}
                    className={cn(
                      "text-left p-8 rounded-xl bg-white transition-all duration-300",
                      "border-2 shadow-md",
                      playable
                        ? "border-[#C02026]/15 hover:border-[#CF8420] hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                        : "border-dashed border-[#C02026]/20 opacity-70 cursor-not-allowed"
                    )}
                  >
                    <div className="text-5xl mb-4">{game.emoji}</div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {game.title}
                    </h3>
                    <p className="text-sm text-foreground/60 mb-4">
                      {game.description}
                    </p>
                    <span
                      className={cn(
                        "inline-block text-xs font-semibold uppercase tracking-wide",
                        playable ? "text-[#CF8420]" : "text-foreground/40"
                      )}
                    >
                      {playable ? "Play now →" : "Coming soon"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Game player modal */}
      {activeGame && ActiveComponent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setActiveGame(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#C02026]/10">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span>{activeGame.emoji}</span>
                {activeGame.title}
              </h3>
              <button
                type="button"
                onClick={() => setActiveGame(null)}
                aria-label="Close game"
                className="p-2 rounded-lg text-foreground/60 hover:text-[#C02026] hover:bg-[#CF8420]/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <ActiveComponent />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
