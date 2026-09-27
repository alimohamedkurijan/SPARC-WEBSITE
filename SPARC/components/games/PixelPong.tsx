"use client";

import { useEffect, useRef, useState } from "react";

// Internal resolution (scaled to fit via CSS).
const W = 640;
const H = 400;
const PADDLE_H = 68;
const PADDLE_W = 12;
const BALL = 12;
const WIN_SCORE = 7;

// Difficulty: MODERATE — the CPU is competent but beatable, not perfect.
const CPU_SPEED = 4.2;
const CPU_DEADZONE = 24;
const BALL_START = 5;
const BALL_SPEEDUP = 1.04;
const BALL_MAX = 10;

type Phase = "ready" | "playing" | "over";

interface Refs {
  playerY: number;
  cpuY: number;
  bx: number;
  by: number;
  bvx: number;
  bvy: number;
  playerScore: number;
  cpuScore: number;
}

export default function PixelPong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const phaseRef = useRef<Phase>("ready");
  const [phase, setPhase] = useState<Phase>("ready");
  const [scores, setScores] = useState({ player: 0, cpu: 0 });

  const g = useRef<Refs>({
    playerY: H / 2 - PADDLE_H / 2,
    cpuY: H / 2 - PADDLE_H / 2,
    bx: W / 2,
    by: H / 2,
    bvx: BALL_START,
    bvy: 2,
    playerScore: 0,
    cpuScore: 0,
  });

  const setPhaseBoth = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const serve = (towardPlayer: boolean) => {
    const s = g.current;
    s.bx = W / 2;
    s.by = H / 2;
    // vary angle without Math.random dependency on render
    const dir = towardPlayer ? -1 : 1;
    s.bvx = BALL_START * dir;
    s.bvy = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2);
  };

  const resetGame = () => {
    const s = g.current;
    s.playerScore = 0;
    s.cpuScore = 0;
    s.playerY = H / 2 - PADDLE_H / 2;
    s.cpuY = H / 2 - PADDLE_H / 2;
    setScores({ player: 0, cpu: 0 });
    serve(Math.random() > 0.5);
  };

  const start = () => {
    resetGame();
    setPhaseBoth("playing");
  };

  // Draw a rectangle helper is inline in loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      const s = g.current;

      if (phaseRef.current === "playing") {
        // Move ball
        s.bx += s.bvx;
        s.by += s.bvy;

        // Top / bottom walls
        if (s.by <= 0) { s.by = 0; s.bvy = Math.abs(s.bvy); }
        if (s.by + BALL >= H) { s.by = H - BALL; s.bvy = -Math.abs(s.bvy); }

        // Player paddle (left)
        if (
          s.bx <= PADDLE_W &&
          s.by + BALL >= s.playerY &&
          s.by <= s.playerY + PADDLE_H &&
          s.bvx < 0
        ) {
          s.bx = PADDLE_W;
          s.bvx = Math.min(Math.abs(s.bvx) * BALL_SPEEDUP, BALL_MAX);
          const rel = (s.by + BALL / 2 - (s.playerY + PADDLE_H / 2)) / (PADDLE_H / 2);
          s.bvy = rel * 5;
        }

        // CPU paddle (right)
        if (
          s.bx + BALL >= W - PADDLE_W &&
          s.by + BALL >= s.cpuY &&
          s.by <= s.cpuY + PADDLE_H &&
          s.bvx > 0
        ) {
          s.bx = W - PADDLE_W - BALL;
          s.bvx = -Math.min(Math.abs(s.bvx) * BALL_SPEEDUP, BALL_MAX);
          const rel = (s.by + BALL / 2 - (s.cpuY + PADDLE_H / 2)) / (PADDLE_H / 2);
          s.bvy = rel * 5;
        }

        // CPU AI: track the ball center quickly.
        const target = s.by + BALL / 2 - PADDLE_H / 2;
        if (s.cpuY + CPU_DEADZONE < target) s.cpuY += CPU_SPEED;
        else if (s.cpuY - CPU_DEADZONE > target) s.cpuY -= CPU_SPEED;
        s.cpuY = Math.max(0, Math.min(H - PADDLE_H, s.cpuY));

        // Scoring
        if (s.bx + BALL < 0) {
          s.cpuScore++;
          setScores({ player: s.playerScore, cpu: s.cpuScore });
          if (s.cpuScore >= WIN_SCORE) setPhaseBoth("over");
          else serve(false);
        } else if (s.bx > W) {
          s.playerScore++;
          setScores({ player: s.playerScore, cpu: s.cpuScore });
          if (s.playerScore >= WIN_SCORE) setPhaseBoth("over");
          else serve(true);
        }
      }

      // ---- Draw ----
      ctx.fillStyle = "#070c14";
      ctx.fillRect(0, 0, W, H);

      // Net
      ctx.fillStyle = "#4a3f30";
      for (let y = 0; y < H; y += 24) ctx.fillRect(W / 2 - 2, y, 4, 14);

      // Paddles
      ctx.fillStyle = "#22d3ee";
      ctx.fillRect(0, s.playerY, PADDLE_W, PADDLE_H);
      ctx.fillStyle = "#4f8cff";
      ctx.fillRect(W - PADDLE_W, s.cpuY, PADDLE_W, PADDLE_H);

      // Ball
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(s.bx, s.by, BALL, BALL);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Player controls: pointer + keyboard
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const moveTo = (clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scale = H / rect.height;
      const y = (clientY - rect.top) * scale - PADDLE_H / 2;
      g.current.playerY = Math.max(0, Math.min(H - PADDLE_H, y));
    };

    const onMouse = (e: MouseEvent) => moveTo(e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) {
        e.preventDefault();
        moveTo(e.touches[0].clientY);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") { e.preventDefault(); g.current.playerY = Math.max(0, g.current.playerY - 26); }
      if (e.key === "ArrowDown") { e.preventDefault(); g.current.playerY = Math.min(H - PADDLE_H, g.current.playerY + 26); }
    };

    canvas.addEventListener("mousemove", onMouse);
    canvas.addEventListener("touchmove", onTouch, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      canvas.removeEventListener("mousemove", onMouse);
      canvas.removeEventListener("touchmove", onTouch);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const playerWon = scores.player >= WIN_SCORE;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Scoreboard */}
      <div className="flex items-center justify-center gap-8 font-pixel text-sm uppercase">
        <div className="text-center">
          <div className="text-[#22d3ee] text-[9px] mb-2">You</div>
          <div className="text-2xl text-[#ffffff]">{scores.player}</div>
        </div>
        <div className="text-[#8ea3b5] text-[9px]">first to {WIN_SCORE}</div>
        <div className="text-center">
          <div className="text-[#4f8cff] text-[9px] mb-2">CPU</div>
          <div className="text-2xl text-[#ffffff]">{scores.cpu}</div>
        </div>
      </div>

      {/* Court */}
      <div className="relative w-full max-w-xl">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full h-auto border-4 border-black bg-[#070c14] touch-none"
          style={{ imageRendering: "pixelated" }}
        />

        {phase !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70">
            {phase === "over" && (
              <p className={`font-pixel text-lg uppercase ${playerWon ? "text-[#7fae3a]" : "text-[#4f8cff]"}`}>
                {playerWon ? "You Win!" : "CPU Wins"}
              </p>
            )}
            <button onClick={start} className="pixel-btn px-6 py-3 text-xs bg-[#22d3ee] text-black">
              {phase === "over" ? "Rematch" : "Start Match"}
            </button>
            <p className="font-retro text-lg text-[#8ea3b5]">
              Move mouse / drag / ↑ ↓ keys to control your paddle
            </p>
          </div>
        )}
      </div>

      <p className="font-retro text-lg text-[#8ea3b5] text-center leading-tight">
        A fair match — the CPU plays a solid game, but you can definitely take it. First to {WIN_SCORE}.
      </p>
    </div>
  );
}
