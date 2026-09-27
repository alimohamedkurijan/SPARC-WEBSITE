"use client";

import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// AI vs Real — round configuration
// -----------------------------------------------------------------------------
// Add your video clips here. For each clip:
//   - `src`   : path to the video. Put files in `public/videos/ai-vs-real/`
//               and reference them as "/videos/ai-vs-real/yourfile.mp4".
//               A full remote URL (https://...) also works.
//   - `isAI`  : true if the clip is AI-generated, false if it's a real video.
//
// The game shows 8 clips and the player must get at least 6 right to win.
// Add at least 8 entries below (extra entries are fine — 8 are picked at random
// each play).
// -----------------------------------------------------------------------------

export interface Round {
  src: string;
  isAI: boolean;
}

// Clip pool. 8 are chosen at random each play.
//   AI  = OpenAI Sora text-to-video showcase clips (genuinely AI-generated).
//   REAL = Pexels stock footage (free license, real camera footage).
// Files are served locally from public/videos/ai-vs-real/ (works offline).
// Swap in your own clips anytime — see that folder's README.md.
export const rounds: Round[] = [
  // --- AI-generated (OpenAI Sora) ---
  { src: "/videos/ai-vs-real/ai-octopus-and-crab.mp4", isAI: true },
  { src: "/videos/ai-vs-real/ai-paper-airplanes.mp4", isAI: true },
  { src: "/videos/ai-vs-real/ai-cat-on-bed.mp4", isAI: true },
  { src: "/videos/ai-vs-real/ai-birds-over-river.mp4", isAI: true },
  { src: "/videos/ai-vs-real/ai-wooly-mammoth.mp4", isAI: true },
  { src: "/videos/ai-vs-real/ai-mitten-astronaut.mp4", isAI: true },
  { src: "/videos/ai-vs-real/ai-big-sur.mp4", isAI: true },

  // --- Real footage (Pexels) ---
  { src: "/videos/ai-vs-real/real-857195.mp4", isAI: false },
  { src: "/videos/ai-vs-real/real-3571264.mp4", isAI: false },
  { src: "/videos/ai-vs-real/real-2169880.mp4", isAI: false },
  { src: "/videos/ai-vs-real/real-1409899.mp4", isAI: false },
  { src: "/videos/ai-vs-real/real-3195394.mp4", isAI: false },
  { src: "/videos/ai-vs-real/real-4763824.mp4", isAI: false },
  { src: "/videos/ai-vs-real/real-5752729.mp4", isAI: false },
  { src: "/videos/ai-vs-real/real-6981411.mp4", isAI: false },
  { src: "/videos/ai-vs-real/real-4114797.mp4", isAI: false },
];

const ROUNDS_PER_GAME = 8;
const ROUNDS_TO_WIN = 6;

type Answer = boolean; // true = player guessed "AI"

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function AIvsReal() {
  // Pick up to ROUNDS_PER_GAME clips at random for this play-through.
  const [playRounds, setPlayRounds] = useState<Round[]>(() =>
    shuffle(rounds).slice(0, ROUNDS_PER_GAME)
  );
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<Answer | null>(null);
  const [finished, setFinished] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const total = playRounds.length;
  const round = playRounds[current];
  const needed = Math.min(ROUNDS_TO_WIN, total);

  const lastWasCorrect = useMemo(() => {
    if (answered === null || !round) return null;
    return answered === round.isAI;
  }, [answered, round]);

  const handleGuess = (guessedAI: boolean) => {
    if (answered !== null || !round) return;
    setAnswered(guessedAI);
    if (guessedAI === round.isAI) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (current + 1 >= total) {
      setFinished(true);
      return;
    }
    setCurrent((c) => c + 1);
    setAnswered(null);
  };

  const handleRestart = () => {
    setPlayRounds(shuffle(rounds).slice(0, ROUNDS_PER_GAME));
    setCurrent(0);
    setScore(0);
    setAnswered(null);
    setFinished(false);
  };

  // No clips configured yet.
  if (total === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🎬</div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          No clips added yet
        </h3>
        <p className="text-foreground/60 max-w-sm mx-auto">
          Add video clips in{" "}
          <code className="px-1 py-0.5 rounded bg-[#4f8cff]/10 text-[#4f8cff]">
            components/games/AIvsReal.tsx
          </code>{" "}
          to start playing.
        </p>
      </div>
    );
  }

  // Results screen.
  if (finished) {
    const won = score >= needed;
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">{won ? "🏆" : "🤔"}</div>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          {won ? "You win!" : "So close!"}
        </h3>
        <p className="text-lg text-foreground/70 mb-1">
          You scored{" "}
          <span className="font-bold text-[#4f8cff]">
            {score} / {total}
          </span>
        </p>
        <p className="text-sm text-foreground/50 mb-8">
          {won
            ? `You needed ${needed} to win — nicely spotted!`
            : `You needed ${needed} to win. Give it another go!`}
        </p>
        <button
          type="button"
          onClick={handleRestart}
          className={cn(
            "px-8 py-3 text-base font-semibold rounded-lg text-white",
            "bg-[#22d3ee] hover:bg-[#22d3ee]/90 hover:scale-105 active:scale-95",
            "transition-all"
          )}
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-foreground">
          Round {current + 1} of {total}
        </span>
        <span className="font-semibold text-[#4f8cff]">
          Score: {score} · Need {needed} to win
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#D9D9D9] overflow-hidden">
        <div
          className="h-full bg-[#22d3ee] transition-all duration-300"
          style={{ width: `${((current + (answered !== null ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      {/* Video */}
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
        <video
          key={round.src}
          ref={videoRef}
          src={round.src}
          className="w-full h-full object-contain"
          controls
          autoPlay
          muted
          loop
          playsInline
        />
      </div>

      {/* Prompt */}
      <p className="text-center text-lg font-semibold text-foreground">
        Is this video <span className="text-[#22d3ee]">AI-generated</span> or{" "}
        <span className="text-[#4f8cff]">real</span>?
      </p>

      {/* Answer buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleGuess(false)}
          disabled={answered !== null}
          className={cn(
            "py-4 rounded-xl text-lg font-bold border-2 transition-all",
            answered === null
              ? "border-[#4f8cff] text-[#4f8cff] hover:bg-[#4f8cff] hover:text-white"
              : round.isAI === false
                ? "border-green-600 bg-green-600 text-white"
                : answered === false
                  ? "border-red-500 bg-red-500 text-white"
                  : "border-foreground/15 text-foreground/40",
            answered !== null && "cursor-default"
          )}
        >
          Real
        </button>
        <button
          type="button"
          onClick={() => handleGuess(true)}
          disabled={answered !== null}
          className={cn(
            "py-4 rounded-xl text-lg font-bold border-2 transition-all",
            answered === null
              ? "border-[#22d3ee] text-[#22d3ee] hover:bg-[#22d3ee] hover:text-[#06121f]"
              : round.isAI === true
                ? "border-green-600 bg-green-600 text-white"
                : answered === true
                  ? "border-red-500 bg-red-500 text-white"
                  : "border-foreground/15 text-foreground/40",
            answered !== null && "cursor-default"
          )}
        >
          AI
        </button>
      </div>

      {/* Feedback + next */}
      {answered !== null && (
        <div className="text-center space-y-3">
          <p
            className={cn(
              "text-lg font-bold",
              lastWasCorrect ? "text-green-600" : "text-red-500"
            )}
          >
            {lastWasCorrect ? "Correct! 🎉" : "Not quite."}{" "}
            <span className="font-normal text-foreground/70">
              This one was {round.isAI ? "AI-generated" : "real"}.
            </span>
          </p>
          <button
            type="button"
            onClick={handleNext}
            className={cn(
              "px-8 py-3 text-base font-semibold rounded-lg text-white",
              "bg-[#4f8cff] hover:bg-[#4f8cff]/90 hover:scale-105 active:scale-95",
              "transition-all"
            )}
          >
            {current + 1 >= total ? "See Results" : "Next Round"}
          </button>
        </div>
      )}
    </div>
  );
}
