"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Robot Path — guide the robot from Start (A) to Goal (B) on a 16x16 grid.
// The player queues moves ("Up 3", "Left 4", ...) then runs them. The robot
// crashes if it hits a wall or leaves the grid.
// -----------------------------------------------------------------------------

const GRID = 16;

type Dir = "up" | "down" | "left" | "right";

const DIRS: Record<Dir, { dr: number; dc: number; arrow: string; label: string }> = {
  up: { dr: -1, dc: 0, arrow: "↑", label: "Up" },
  down: { dr: 1, dc: 0, arrow: "↓", label: "Down" },
  left: { dr: 0, dc: -1, arrow: "←", label: "Left" },
  right: { dr: 0, dc: 1, arrow: "→", label: "Right" },
};

interface Command {
  dir: Dir;
  steps: number;
}

interface Level {
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  start: [number, number];
  goal: [number, number];
  walls: Set<string>;
}

// Helpers to build wall runs.
const key = (r: number, c: number) => `${r},${c}`;
function hline(r: number, c1: number, c2: number): string[] {
  const out: string[] = [];
  for (let c = c1; c <= c2; c++) out.push(key(r, c));
  return out;
}
function vline(c: number, r1: number, r2: number): string[] {
  const out: string[] = [];
  for (let r = r1; r <= r2; r++) out.push(key(r, c));
  return out;
}

const LEVELS: Level[] = [
  {
    name: "Open Field",
    difficulty: "Easy",
    start: [13, 2],
    goal: [3, 13],
    walls: new Set<string>(),
  },
  {
    name: "First Wall",
    difficulty: "Easy",
    start: [14, 2],
    goal: [14, 13],
    walls: new Set<string>([...vline(8, 10, 15)]),
  },
  {
    name: "Zigzag",
    difficulty: "Medium",
    start: [1, 1],
    goal: [14, 14],
    walls: new Set<string>([...hline(5, 0, 11), ...hline(10, 4, 15)]),
  },
  {
    name: "The Snake",
    difficulty: "Medium",
    start: [1, 14],
    goal: [14, 1],
    walls: new Set<string>([...vline(5, 4, 15), ...vline(10, 0, 11)]),
  },
  {
    name: "The Maze",
    difficulty: "Hard",
    start: [0, 0],
    goal: [15, 15],
    walls: new Set<string>([
      ...hline(2, 0, 14),
      ...hline(4, 1, 15),
      ...hline(6, 0, 14),
      ...hline(8, 1, 15),
      ...hline(10, 0, 14),
      ...hline(12, 1, 15),
      ...hline(14, 0, 14),
    ]),
  },
];

const STEP_MS = 160;

export default function RobotPath() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [program, setProgram] = useState<Command[]>([]);
  const [dir, setDir] = useState<Dir>("up");
  const [steps, setSteps] = useState(1);
  const [robot, setRobot] = useState<[number, number]>(LEVELS[0].start);
  const [crashCell, setCrashCell] = useState<[number, number] | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<null | "win" | "crash" | "stopped">(null);
  const [message, setMessage] = useState("");
  const [solved, setSolved] = useState<Set<number>>(new Set());

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const level = LEVELS[levelIndex];

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };

  // Reset board when the level changes (and on unmount).
  useEffect(() => {
    clearTimers();
    setProgram([]);
    setRobot(level.start);
    setCrashCell(null);
    setRunning(false);
    setResult(null);
    setMessage("");
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIndex]);

  const addCommand = () => {
    if (running) return;
    setProgram((p) => [...p, { dir, steps }]);
    setResult(null);
    setMessage("");
  };

  const removeCommand = (i: number) => {
    if (running) return;
    setProgram((p) => p.filter((_, idx) => idx !== i));
  };

  const resetBoard = () => {
    clearTimers();
    setRobot(level.start);
    setCrashCell(null);
    setRunning(false);
    setResult(null);
    setMessage("");
  };

  const run = () => {
    if (running || program.length === 0) return;
    setResult(null);
    setMessage("");
    setCrashCell(null);

    // Compute the full single-step path and the outcome.
    type Frame = { r: number; c: number; crash?: boolean; oob?: boolean };
    const frames: Frame[] = [];
    let cur = { r: level.start[0], c: level.start[1] };
    let outcome: "win" | "crash" | "stopped" = "stopped";

    outer: for (const cmd of program) {
      const { dr, dc } = DIRS[cmd.dir];
      for (let i = 0; i < cmd.steps; i++) {
        const nr = cur.r + dr;
        const nc = cur.c + dc;
        if (nr < 0 || nr >= GRID || nc < 0 || nc >= GRID) {
          frames.push({ r: nr, c: nc, crash: true, oob: true });
          outcome = "crash";
          break outer;
        }
        if (level.walls.has(key(nr, nc))) {
          frames.push({ r: nr, c: nc, crash: true });
          outcome = "crash";
          break outer;
        }
        cur = { r: nr, c: nc };
        frames.push({ r: nr, c: nc });
        if (nr === level.goal[0] && nc === level.goal[1]) {
          outcome = "win";
          break outer;
        }
      }
    }

    setRunning(true);
    setRobot(level.start);

    frames.forEach((f, i) => {
      const t = setTimeout(() => {
        if (f.crash) {
          if (!f.oob) setCrashCell([f.r, f.c]);
          setRunning(false);
          setResult("crash");
          setMessage(
            f.oob ? "The robot flew off the edge! 💥" : "The robot hit a wall! 💥"
          );
        } else {
          setRobot([f.r, f.c]);
          if (i === frames.length - 1) {
            setRunning(false);
            setResult(outcome);
            if (outcome === "win") {
              setMessage("Goal reached! 🎉");
              setSolved((s) => new Set(s).add(levelIndex));
            } else {
              setMessage("Robot stopped short of the goal. Keep trying!");
            }
          }
        }
      }, STEP_MS * (i + 1));
      timers.current.push(t);
    });
  };

  const goToLevel = (i: number) => {
    if (i < 0 || i >= LEVELS.length) return;
    setLevelIndex(i);
  };

  const allSolved = solved.size === LEVELS.length;

  return (
    <div className="space-y-4">
      {/* Level tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {LEVELS.map((lv, i) => (
          <button
            key={lv.name}
            type="button"
            onClick={() => goToLevel(i)}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-full border-2 transition-all",
              i === levelIndex
                ? "border-[#4f8cff] bg-[#4f8cff] text-white"
                : "border-[#4f8cff]/20 text-foreground/70 hover:border-[#22d3ee]"
            )}
          >
            {solved.has(i) ? "✓ " : ""}
            {i + 1}
          </button>
        ))}
      </div>

      <div className="text-center">
        <h3 className="text-lg font-bold text-foreground">
          Level {levelIndex + 1}: {level.name}
        </h3>
        <span
          className={cn(
            "inline-block mt-1 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide rounded",
            level.difficulty === "Easy" && "bg-green-100 text-green-700",
            level.difficulty === "Medium" && "bg-amber-100 text-amber-700",
            level.difficulty === "Hard" && "bg-red-100 text-red-700"
          )}
        >
          {level.difficulty}
        </span>
      </div>

      {/* Grid */}
      <div className="mx-auto w-full max-w-md">
        <div
          className="grid gap-px bg-[#4f8cff]/10 p-px rounded-lg overflow-hidden"
          style={{ gridTemplateColumns: `repeat(${GRID}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: GRID * GRID }).map((_, idx) => {
            const r = Math.floor(idx / GRID);
            const c = idx % GRID;
            const isWall = level.walls.has(key(r, c));
            const isStart = r === level.start[0] && c === level.start[1];
            const isGoal = r === level.goal[0] && c === level.goal[1];
            const isRobot = robot[0] === r && robot[1] === c;
            const isCrash = crashCell?.[0] === r && crashCell?.[1] === c;
            return (
              <div
                key={idx}
                className={cn(
                  "aspect-square flex items-center justify-center text-[10px] sm:text-xs leading-none select-none",
                  isWall ? "bg-[#3a3a3a]" : "bg-white",
                  isGoal && !isRobot && "bg-[#22d3ee]/25",
                  isStart && !isRobot && "bg-green-100"
                )}
              >
                {isRobot ? (
                  <span className={cn(isCrash && "animate-pulse")}>🤖</span>
                ) : isCrash ? (
                  "💥"
                ) : isGoal ? (
                  "🎯"
                ) : isStart ? (
                  <span className="text-green-600 font-bold">A</span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status message */}
      <div className="h-6 text-center">
        {message && (
          <p
            className={cn(
              "text-sm font-semibold",
              result === "win"
                ? "text-green-600"
                : result === "crash"
                  ? "text-red-500"
                  : "text-foreground/70"
            )}
          >
            {message}
          </p>
        )}
      </div>

      {/* Win / next-level actions */}
      {result === "win" && (
        <div className="text-center">
          {levelIndex < LEVELS.length - 1 ? (
            <button
              type="button"
              onClick={() => goToLevel(levelIndex + 1)}
              className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-[#22d3ee] hover:bg-[#22d3ee]/90 text-[#06121f] hover:scale-105 active:scale-95 transition-all"
            >
              Next Level →
            </button>
          ) : (
            <p className="text-base font-bold text-[#4f8cff]">
              {allSolved ? "🏆 All levels complete — you're a master navigator!" : "Final level cleared! 🎉"}
            </p>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="rounded-xl border-2 border-[#4f8cff]/10 p-4 space-y-4">
        {/* Direction + steps builder */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="grid grid-cols-4 gap-1">
            {(Object.keys(DIRS) as Dir[]).map((d) => (
              <button
                key={d}
                type="button"
                disabled={running}
                onClick={() => setDir(d)}
                aria-label={DIRS[d].label}
                className={cn(
                  "w-10 h-10 rounded-lg text-lg font-bold border-2 transition-all disabled:opacity-40",
                  dir === d
                    ? "border-[#4f8cff] bg-[#4f8cff] text-white"
                    : "border-[#4f8cff]/20 text-foreground hover:border-[#22d3ee]"
                )}
              >
                {DIRS[d].arrow}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={running || steps <= 1}
              onClick={() => setSteps((s) => Math.max(1, s - 1))}
              className="w-8 h-8 rounded-lg border-2 border-[#4f8cff]/20 font-bold disabled:opacity-40 hover:border-[#22d3ee]"
            >
              −
            </button>
            <span className="w-8 text-center font-bold text-foreground">{steps}</span>
            <button
              type="button"
              disabled={running || steps >= GRID - 1}
              onClick={() => setSteps((s) => Math.min(GRID - 1, s + 1))}
              className="w-8 h-8 rounded-lg border-2 border-[#4f8cff]/20 font-bold disabled:opacity-40 hover:border-[#22d3ee]"
            >
              +
            </button>
          </div>

          <button
            type="button"
            disabled={running}
            onClick={addCommand}
            className="px-4 h-10 rounded-lg text-sm font-semibold bg-[#22d3ee] hover:bg-[#22d3ee]/90 text-[#06121f] disabled:opacity-40 transition-colors"
          >
            + Add {DIRS[dir].label} {steps}
          </button>
        </div>

        {/* Program list */}
        <div className="min-h-[2.5rem] flex flex-wrap items-center gap-2 justify-center">
          {program.length === 0 ? (
            <span className="text-sm text-foreground/40">
              No moves yet — pick a direction and add moves.
            </span>
          ) : (
            program.map((cmd, i) => (
              <button
                key={i}
                type="button"
                disabled={running}
                onClick={() => removeCommand(i)}
                title="Remove"
                className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold bg-[#4f8cff]/10 text-[#4f8cff] hover:bg-red-500 hover:text-white transition-colors disabled:opacity-60"
              >
                {DIRS[cmd.dir].arrow} {cmd.steps}
                <span className="opacity-50 group-hover:opacity-100">×</span>
              </button>
            ))
          )}
        </div>

        {/* Run / reset */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={running || program.length === 0}
            onClick={run}
            className="px-6 py-2.5 text-sm font-bold rounded-lg bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-white disabled:opacity-40 hover:scale-105 active:scale-95 transition-all"
          >
            {running ? "Running…" : "▶ Run"}
          </button>
          <button
            type="button"
            disabled={running}
            onClick={resetBoard}
            className="px-6 py-2.5 text-sm font-semibold rounded-lg border-2 border-[#4f8cff]/30 text-[#4f8cff] hover:bg-[#4f8cff]/5 disabled:opacity-40 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
