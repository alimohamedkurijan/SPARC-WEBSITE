"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { games, type Game } from "@/lib/games";

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  const ActiveComponent = activeGame?.component ?? null;

  return (
    <main className="min-h-screen relative">
      <Header />

      <section className="pt-32 pb-20 lg:pb-28 min-h-screen relative overflow-hidden">
        <div className="absolute left-1/2 top-40 -translate-x-1/2 w-[70vw] h-[70vw] max-w-[640px] max-h-[640px] rounded-full bg-[#4f8cff]/7 blur-[130px] -z-0" />

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-14 space-y-4">
            <span className="neo-chip px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]">
              ★ Game Zone
            </span>
            <h1 className="font-display font-extrabold text-5xl md:text-7xl tracking-tight">
              The <span className="grad-text text-glow">Arcade</span>
            </h1>
            <p className="text-lg md:text-xl text-[#ffffff]/70 max-w-2xl mx-auto">
              Select a cabinet and press start. New games added regularly.
            </p>
          </div>

          {games.length === 0 ? (
            <div className="max-w-xl mx-auto text-center py-16">
              <div className="text-7xl mb-6">🎮</div>
              <h2 className="font-display font-bold text-2xl text-[#ffffff] mb-4">
                Games on the way
              </h2>
              <Link href="/" className="neo-btn neo-btn-primary px-6 py-3">
                Back Home
              </Link>
            </div>
          ) : (
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
                      "neo-card p-7 text-left flex flex-col",
                      playable ? "cursor-pointer" : "opacity-55 cursor-not-allowed"
                    )}
                  >
                    <div className="text-5xl mb-4">{game.emoji}</div>
                    <h3 className="font-display font-bold text-xl text-[#ffffff] mb-2">
                      {game.title}
                    </h3>
                    <p className="text-sm text-[#ffffff]/60 leading-relaxed flex-1 mb-4">
                      {game.description}
                    </p>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        playable ? "text-[#22d3ee]" : "text-[#06121f]/40"
                      )}
                    >
                      {playable ? "▶ Play" : "Coming soon"}
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setActiveGame(null)}
        >
          <div
            className="relative w-full max-w-3xl my-8 neo-card !rounded-2xl bg-[#0b111c]/95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="font-display font-bold text-lg text-[#ffffff] flex items-center gap-2">
                <span className="text-2xl">{activeGame.emoji}</span>
                {activeGame.title}
              </h3>
              <button
                type="button"
                onClick={() => setActiveGame(null)}
                aria-label="Close game"
                className="neo-btn neo-btn-ghost px-4 py-2 text-sm"
              >
                ✕ Exit
              </button>
            </div>
            <div className="p-5 md:p-6">
              <ActiveComponent />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
