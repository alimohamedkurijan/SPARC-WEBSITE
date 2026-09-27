"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Circuit Connect — rotate wire tiles to route power from the battery (⚡) to
// EVERY goal (🎯) on the board. Each tile has connectors on some of its 4 sides;
// two adjacent tiles are linked only if both have a connector facing each other.
// Tap a tile to rotate it 90°. A level is solved when all goals are powered.
// Later levels add more goals and bigger boards.
// -----------------------------------------------------------------------------

// Connector order: [up, right, down, left]
type Conn = [boolean, boolean, boolean, boolean];
type Tile = { conn: Conn; kind: "source" | "target" | "wire" };
type Cell = [number, number];

const DELTA: [number, number][] = [
  [-1, 0], // up
  [0, 1], // right
  [1, 0], // down
  [0, -1], // left
];

const key = (r: number, c: number) => `${r},${c}`;

function rotateCW(conn: Conn, times = 1): Conn {
  let x = conn;
  const n = (((times % 4) + 4) % 4);
  for (let i = 0; i < n; i++) {
    x = [x[3], x[0], x[1], x[2]];
  }
  return x;
}

interface LevelDef {
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  rows: number;
  cols: number;
  source: Cell;
  targets: Cell[]; // power ALL of these to win
  // Polylines of adjacent cells describing the SOLVED wiring.
  paths: Cell[][];
}

const LEVELS: LevelDef[] = [
  {
    name: "First Circuit",
    difficulty: "Easy",
    rows: 4,
    cols: 4,
    source: [0, 0],
    targets: [[3, 3]],
    paths: [[[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3]]],
  },
  {
    name: "Two Goals",
    difficulty: "Easy",
    rows: 4,
    cols: 4,
    source: [0, 0],
    targets: [[0, 3], [3, 3]],
    paths: [
      [[0, 0], [0, 1], [0, 2], [0, 3]],
      [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3]],
    ],
  },
  {
    name: "Split Feed",
    difficulty: "Medium",
    rows: 5,
    cols: 5,
    source: [2, 0],
    targets: [[0, 4], [4, 4]],
    paths: [
      [[2, 0], [2, 1], [2, 2], [1, 2], [0, 2], [0, 3], [0, 4]],
      [[2, 2], [3, 2], [4, 2], [4, 3], [4, 4]],
    ],
  },
  {
    name: "Power Hub",
    difficulty: "Medium",
    rows: 5,
    cols: 5,
    source: [2, 2],
    targets: [[0, 0], [0, 4], [4, 2]],
    paths: [
      [[2, 2], [2, 1], [2, 0], [1, 0], [0, 0]],
      [[2, 2], [2, 3], [2, 4], [1, 4], [0, 4]],
      [[2, 2], [3, 2], [4, 2]],
      [[2, 2], [1, 2]],
    ],
  },
  {
    name: "Three Corners",
    difficulty: "Hard",
    rows: 6,
    cols: 6,
    source: [0, 0],
    targets: [[0, 5], [5, 0], [5, 5]],
    paths: [
      [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5]],
      [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]],
      [[5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5]],
      [[0, 2], [1, 2], [2, 2], [3, 2], [3, 3], [3, 4], [3, 5]],
      [[2, 0], [2, 1], [2, 2]],
    ],
  },
  {
    name: "Full Grid",
    difficulty: "Hard",
    rows: 6,
    cols: 6,
    source: [2, 2],
    targets: [[0, 0], [0, 5], [5, 0], [5, 5]],
    paths: [
      [[2, 2], [2, 1], [2, 0], [1, 0], [0, 0]],
      [[2, 2], [1, 2], [0, 2], [0, 3], [0, 4], [0, 5]],
      [[2, 2], [3, 2], [4, 2], [5, 2], [5, 1], [5, 0]],
      [[2, 2], [2, 3], [2, 4], [3, 4], [4, 4], [5, 4], [5, 5]],
    ],
  },
];

// Countdown per difficulty (seconds). The clock starts on the first rotation.
const TIME_LIMITS: Record<LevelDef["difficulty"], number> = {
  Easy: 60,
  Medium: 90,
  Hard: 150,
};

function formatTime(total: number): string {
  const s = Math.max(0, total);
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${String(ss).padStart(2, "0")}`;
}

function buildSolved(level: LevelDef): (Tile | null)[][] {
  const { rows, cols, source, targets, paths } = level;
  const isTarget = (r: number, c: number) =>
    targets.some(([tr, tc]) => tr === r && tc === c);

  const conn: (Conn | null)[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null)
  );
  const ensure = (r: number, c: number): Conn => {
    if (!conn[r][c]) conn[r][c] = [false, false, false, false];
    return conn[r][c] as Conn;
  };
  for (const line of paths) {
    for (let i = 0; i < line.length - 1; i++) {
      const [r, c] = line[i];
      const [r2, c2] = line[i + 1];
      const dr = r2 - r;
      const dc = c2 - c;
      const d = dr === -1 ? 0 : dc === 1 ? 1 : dr === 1 ? 2 : 3;
      ensure(r, c)[d] = true;
      ensure(r2, c2)[(d + 2) % 4] = true;
    }
  }
  return conn.map((row, r) =>
    row.map((cc, c) => {
      if (!cc) return null;
      const kind: Tile["kind"] =
        r === source[0] && c === source[1]
          ? "source"
          : isTarget(r, c)
            ? "target"
            : "wire";
      return { conn: cc, kind };
    })
  );
}

function computePowered(tiles: (Tile | null)[][], source: Cell): Set<string> {
  const rows = tiles.length;
  const cols = tiles[0].length;
  const seen = new Set<string>();
  if (!tiles[source[0]][source[1]]) return seen;
  const stack: Cell[] = [source];
  seen.add(key(source[0], source[1]));
  while (stack.length) {
    const [r, c] = stack.pop()!;
    const t = tiles[r][c]!;
    for (let d = 0; d < 4; d++) {
      if (!t.conn[d]) continue;
      const nr = r + DELTA[d][0];
      const nc = c + DELTA[d][1];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const nt = tiles[nr][nc];
      if (!nt || !nt.conn[(d + 2) % 4]) continue;
      const nk = key(nr, nc);
      if (seen.has(nk)) continue;
      seen.add(nk);
      stack.push([nr, nc]);
    }
  }
  return seen;
}

const allTargetsPowered = (powered: Set<string>, targets: Cell[]) =>
  targets.every(([r, c]) => powered.has(key(r, c)));

function scramble(
  solved: (Tile | null)[][],
  source: Cell,
  targets: Cell[]
): (Tile | null)[][] {
  let tiles = solved;
  for (let attempt = 0; attempt < 40; attempt++) {
    tiles = solved.map((row) =>
      row.map((t) =>
        t
          ? { conn: rotateCW(t.conn, Math.floor(Math.random() * 4)), kind: t.kind }
          : null
      )
    );
    if (!allTargetsPowered(computePowered(tiles, source), targets)) return tiles;
  }
  return tiles;
}

export default function CircuitConnect() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [tiles, setTiles] = useState<(Tile | null)[][]>(() =>
    scramble(buildSolved(LEVELS[0]), LEVELS[0].source, LEVELS[0].targets)
  );
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(TIME_LIMITS[LEVELS[0].difficulty]);
  const [started, setStarted] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [bestTimes, setBestTimes] = useState<Record<number, number>>({});

  const level = LEVELS[levelIndex];
  const timeLimit = TIME_LIMITS[level.difficulty];

  const loadLevel = (i: number) => {
    const lv = LEVELS[i];
    setTiles(scramble(buildSolved(lv), lv.source, lv.targets));
    setMoves(0);
    setTimeLeft(TIME_LIMITS[lv.difficulty]);
    setStarted(false);
    setTimedOut(false);
  };

  useEffect(() => {
    loadLevel(levelIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIndex]);

  const powered = useMemo(
    () => computePowered(tiles, level.source),
    [tiles, level.source]
  );
  const connectedGoals = level.targets.filter(([r, c]) =>
    powered.has(key(r, c))
  ).length;
  const won = connectedGoals === level.targets.length;

  // Countdown: one tick per second once started, until solved or time runs out.
  useEffect(() => {
    if (!started || won || timedOut) return;
    if (timeLeft <= 0) {
      setTimedOut(true);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [started, won, timedOut, timeLeft]);

  useEffect(() => {
    if (!won) return;
    setSolved((s) => (s.has(levelIndex) ? s : new Set(s).add(levelIndex)));
    const elapsed = timeLimit - timeLeft;
    setBestTimes((b) =>
      b[levelIndex] === undefined || elapsed < b[levelIndex]
        ? { ...b, [levelIndex]: elapsed }
        : b
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won, levelIndex]);

  const rotateTile = (r: number, c: number) => {
    if (won || timedOut || !tiles[r][c]) return;
    if (!started) setStarted(true);
    setTiles((prev) =>
      prev.map((row, rr) =>
        row.map((t, cc) =>
          rr === r && cc === c && t ? { ...t, conn: rotateCW(t.conn) } : t
        )
      )
    );
    setMoves((m) => m + 1);
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
            onClick={() => setLevelIndex(i)}
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

      <p className="text-center text-sm text-foreground/60">
        Tap a tile to rotate it. Power the battery&nbsp;⚡ to <strong>every</strong> goal&nbsp;🎯.
      </p>

      {/* Timer */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-base font-bold tabular-nums transition-colors",
            won
              ? "bg-green-100 text-green-700"
              : timedOut
                ? "bg-red-100 text-red-600"
                : timeLeft <= 10
                  ? "bg-red-100 text-red-600 animate-pulse"
                  : "bg-[#4f8cff]/10 text-[#4f8cff]"
          )}
        >
          ⏱ {formatTime(timeLeft)}
        </span>
        {bestTimes[levelIndex] !== undefined && (
          <span className="text-xs font-medium text-foreground/50">
            Best: {formatTime(bestTimes[levelIndex])}
          </span>
        )}
        {!started && !won && (
          <span className="text-xs text-foreground/40">starts on 1st move</span>
        )}
      </div>

      {/* Board */}
      <div className="mx-auto w-full max-w-sm">
        <div
          className="grid gap-1 rounded-xl bg-[#4f8cff]/5 p-2"
          style={{ gridTemplateColumns: `repeat(${level.cols}, minmax(0, 1fr))` }}
        >
          {tiles.map((row, r) =>
            row.map((tile, c) => {
              if (!tile) {
                return (
                  <div
                    key={key(r, c)}
                    className="aspect-square rounded-sm bg-black/[0.03]"
                  />
                );
              }
              const lit = powered.has(key(r, c));
              const stroke = won && lit ? "#16a34a" : lit ? "#22d3ee" : "#cbd5e1";
              return (
                <button
                  key={key(r, c)}
                  type="button"
                  onClick={() => rotateTile(r, c)}
                  disabled={won || timedOut}
                  className={cn(
                    "relative aspect-square rounded-md bg-white border transition-colors",
                    lit ? "border-[#22d3ee]/40" : "border-black/10",
                    !won && !timedOut && "hover:border-[#4f8cff]/50 active:scale-95",
                    "disabled:cursor-default",
                    timedOut && "opacity-60"
                  )}
                >
                  <svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 w-full h-full"
                  >
                    {tile.conn[0] && (
                      <line x1="50" y1="50" x2="50" y2="2" stroke={stroke} strokeWidth="13" strokeLinecap="round" />
                    )}
                    {tile.conn[1] && (
                      <line x1="50" y1="50" x2="98" y2="50" stroke={stroke} strokeWidth="13" strokeLinecap="round" />
                    )}
                    {tile.conn[2] && (
                      <line x1="50" y1="50" x2="50" y2="98" stroke={stroke} strokeWidth="13" strokeLinecap="round" />
                    )}
                    {tile.conn[3] && (
                      <line x1="50" y1="50" x2="2" y2="50" stroke={stroke} strokeWidth="13" strokeLinecap="round" />
                    )}
                    <circle cx="50" cy="50" r="9" fill={stroke} />
                  </svg>
                  {tile.kind !== "wire" && (
                    <span className="absolute inset-0 flex items-center justify-center text-base sm:text-lg">
                      {tile.kind === "source" ? "⚡" : lit ? "✅" : "🎯"}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Status */}
      <div className="text-center space-y-3">
        <p className="text-sm font-semibold text-foreground/70">
          Goals connected:{" "}
          <span className={cn(won ? "text-green-600" : "text-[#4f8cff]")}>
            {connectedGoals} / {level.targets.length}
          </span>
          <span className="ml-3 font-normal text-foreground/50">
            Rotations: {moves}
          </span>
        </p>
        {won ? (
          <div className="space-y-3">
            <p className="text-base font-bold text-green-600">
              All goals powered in {formatTime(timeLimit - timeLeft)}! 🎉
            </p>
            {levelIndex < LEVELS.length - 1 ? (
              <button
                type="button"
                onClick={() => setLevelIndex(levelIndex + 1)}
                className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-[#22d3ee] hover:bg-[#22d3ee]/90 text-[#06121f] hover:scale-105 active:scale-95 transition-all"
              >
                Next Level →
              </button>
            ) : (
              <p className="text-base font-bold text-[#4f8cff]">
                {allSolved
                  ? "🏆 Every circuit solved — brilliant work!"
                  : "Final circuit complete! 🎉"}
              </p>
            )}
          </div>
        ) : timedOut ? (
          <div className="space-y-3">
            <p className="text-base font-bold text-red-600">⏰ Time&apos;s up!</p>
            <button
              type="button"
              onClick={() => loadLevel(levelIndex)}
              className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-white hover:scale-105 active:scale-95 transition-all"
            >
              Try Again
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => loadLevel(levelIndex)}
            className="px-6 py-2.5 text-sm font-semibold rounded-lg border-2 border-[#4f8cff]/30 text-[#4f8cff] hover:bg-[#4f8cff]/5 transition-colors"
          >
            Shuffle
          </button>
        )}
      </div>
    </div>
  );
}
