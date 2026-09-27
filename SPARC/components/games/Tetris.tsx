"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const COLS = 10;
const ROWS = 20;

type Cell = string | null;
type Shape = number[][];
interface Piece {
  shape: Shape;
  row: number;
  col: number;
  color: string;
}

const SHAPES: { shape: Shape; color: string }[] = [
  { shape: [[1, 1, 1, 1]], color: "#22d3ee" }, // I - orange
  { shape: [[1, 1], [1, 1]], color: "#4f8cff" }, // O - red
  { shape: [[0, 1, 0], [1, 1, 1]], color: "#8ea3b5" }, // T - beige
  { shape: [[0, 1, 1], [1, 1, 0]], color: "#7fae3a" }, // S - green
  { shape: [[1, 1, 0], [0, 1, 1]], color: "#d8262d" }, // Z - bright red
  { shape: [[1, 0, 0], [1, 1, 1]], color: "#4a90d9" }, // J - blue
  { shape: [[0, 0, 1], [1, 1, 1]], color: "#e0a52e" }, // L - amber
];

const emptyBoard = (): Cell[][] =>
  Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null));

const randomPiece = (): Piece => {
  const { shape, color } = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return { shape, color, row: 0, col: Math.floor((COLS - shape[0].length) / 2) };
};

const rotate = (shape: Shape): Shape => {
  const rows = shape.length;
  const cols = shape[0].length;
  const out: Shape = Array.from({ length: cols }, () => Array<number>(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) out[c][rows - 1 - r] = shape[r][c];
  return out;
};

const collides = (board: Cell[][], shape: Shape, row: number, col: number): boolean => {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nr = row + r;
      const nc = col + c;
      if (nc < 0 || nc >= COLS || nr >= ROWS) return true;
      if (nr >= 0 && board[nr][nc]) return true;
    }
  }
  return false;
};

interface State {
  board: Cell[][];
  piece: Piece;
  next: Piece;
  score: number;
  lines: number;
  level: number;
  over: boolean;
  running: boolean;
}

const lockAndSpawn = (s: State): State => {
  const board = s.board.map((row) => [...row]);
  for (let r = 0; r < s.piece.shape.length; r++) {
    for (let c = 0; c < s.piece.shape[r].length; c++) {
      if (!s.piece.shape[r][c]) continue;
      const nr = s.piece.row + r;
      const nc = s.piece.col + c;
      if (nr >= 0) board[nr][nc] = s.piece.color;
    }
  }
  // Clear full lines
  let cleared = 0;
  const kept = board.filter((row) => {
    const full = row.every((cell) => cell);
    if (full) cleared++;
    return !full;
  });
  while (kept.length < ROWS) kept.unshift(Array<Cell>(COLS).fill(null));

  const lines = s.lines + cleared;
  const level = Math.floor(lines / 10) + 1;
  const points = [0, 100, 300, 500, 800][cleared] * s.level;
  const spawned = s.next;
  const over = collides(kept, spawned.shape, spawned.row, spawned.col);

  return {
    ...s,
    board: kept,
    piece: spawned,
    next: randomPiece(),
    score: s.score + points,
    lines,
    level,
    over,
    running: !over,
  };
};

const dropInterval = (level: number) => Math.max(110, 800 - (level - 1) * 70);

export default function Tetris() {
  const [state, setState] = useState<State>(() => ({
    board: emptyBoard(),
    piece: randomPiece(),
    next: randomPiece(),
    score: 0,
    lines: 0,
    level: 1,
    over: false,
    running: false,
  }));
  const stateRef = useRef(state);
  stateRef.current = state;

  const step = useCallback(() => {
    setState((s) => {
      if (s.over || !s.running) return s;
      const nr = s.piece.row + 1;
      if (!collides(s.board, s.piece.shape, nr, s.piece.col)) {
        return { ...s, piece: { ...s.piece, row: nr } };
      }
      return lockAndSpawn(s);
    });
  }, []);

  const move = useCallback((dc: number) => {
    setState((s) => {
      if (s.over || !s.running) return s;
      const nc = s.piece.col + dc;
      return collides(s.board, s.piece.shape, s.piece.row, nc)
        ? s
        : { ...s, piece: { ...s.piece, col: nc } };
    });
  }, []);

  const rotatePiece = useCallback(() => {
    setState((s) => {
      if (s.over || !s.running) return s;
      const shape = rotate(s.piece.shape);
      for (const kick of [0, -1, 1, -2, 2]) {
        if (!collides(s.board, shape, s.piece.row, s.piece.col + kick)) {
          return { ...s, piece: { ...s.piece, shape, col: s.piece.col + kick } };
        }
      }
      return s;
    });
  }, []);

  const hardDrop = useCallback(() => {
    setState((s) => {
      if (s.over || !s.running) return s;
      let nr = s.piece.row;
      while (!collides(s.board, s.piece.shape, nr + 1, s.piece.col)) nr++;
      return lockAndSpawn({ ...s, piece: { ...s.piece, row: nr } });
    });
  }, []);

  const start = () => {
    setState({
      board: emptyBoard(),
      piece: randomPiece(),
      next: randomPiece(),
      score: 0,
      lines: 0,
      level: 1,
      over: false,
      running: true,
    });
  };

  // Gravity loop
  useEffect(() => {
    if (!state.running || state.over) return;
    const id = setInterval(step, dropInterval(state.level));
    return () => clearInterval(id);
  }, [state.running, state.over, state.level, step]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!stateRef.current.running) return;
      switch (e.key) {
        case "ArrowLeft": e.preventDefault(); move(-1); break;
        case "ArrowRight": e.preventDefault(); move(1); break;
        case "ArrowDown": e.preventDefault(); step(); break;
        case "ArrowUp": case "x": case "X": e.preventDefault(); rotatePiece(); break;
        case " ": e.preventDefault(); hardDrop(); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move, step, rotatePiece, hardDrop]);

  // Build display board with active piece overlaid
  const display = state.board.map((row) => [...row]);
  for (let r = 0; r < state.piece.shape.length; r++) {
    for (let c = 0; c < state.piece.shape[r].length; c++) {
      if (!state.piece.shape[r][c]) continue;
      const nr = state.piece.row + r;
      const nc = state.piece.col + c;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) display[nr][nc] = state.piece.color;
    }
  }

  const ctrlBtn = "pixel-btn px-0 py-3 text-xs bg-[#0f1826] text-[#ffffff] active:bg-[#4f8cff]";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-start justify-center gap-4">
        {/* Board */}
        <div
          className="grid gap-px bg-[#070c14] p-1 border-4 border-black"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            width: "min(58vw, 240px)",
          }}
        >
          {display.flat().map((cell, i) => (
            <div
              key={i}
              className="aspect-square"
              style={{
                backgroundColor: cell ?? "#0f1826",
                boxShadow: cell ? "inset -2px -2px 0 rgba(0,0,0,0.4)" : undefined,
              }}
            />
          ))}
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-3 font-pixel text-[9px] text-[#ffffff] uppercase min-w-[84px]">
          <div>
            <div className="text-[#22d3ee]">Score</div>
            <div className="text-sm mt-1">{state.score}</div>
          </div>
          <div>
            <div className="text-[#22d3ee]">Level</div>
            <div className="text-sm mt-1">{state.level}</div>
          </div>
          <div>
            <div className="text-[#22d3ee]">Lines</div>
            <div className="text-sm mt-1">{state.lines}</div>
          </div>
          <div>
            <div className="text-[#22d3ee] mb-1">Next</div>
            <div
              className="grid gap-px bg-[#070c14] p-1 border-2 border-black"
              style={{ gridTemplateColumns: `repeat(${state.next.shape[0].length}, 1fr)` }}
            >
              {state.next.shape.flat().map((v, i) => (
                <div
                  key={i}
                  className="aspect-square w-3"
                  style={{ backgroundColor: v ? state.next.color : "transparent" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status / start */}
      {!state.running && (
        <div className="text-center space-y-3">
          {state.over && (
            <p className="font-pixel text-sm text-[#4f8cff] uppercase">Game Over</p>
          )}
          <button onClick={start} className="pixel-btn px-6 py-3 text-xs bg-[#22d3ee] text-black">
            {state.over ? "Play Again" : "Start"}
          </button>
        </div>
      )}

      {/* On-screen controls (mobile) */}
      {state.running && (
        <div className="w-full max-w-xs grid grid-cols-4 gap-2">
          <button className={ctrlBtn} onClick={() => move(-1)} aria-label="Left">◀</button>
          <button className={ctrlBtn} onClick={rotatePiece} aria-label="Rotate">⟳</button>
          <button className={ctrlBtn} onClick={() => move(1)} aria-label="Right">▶</button>
          <button className={cn(ctrlBtn, "!bg-[#4f8cff]")} onClick={hardDrop} aria-label="Drop">⤓</button>
        </div>
      )}

      <p className="font-retro text-lg text-[#8ea3b5] text-center leading-tight">
        Keys: ← → move · ↑ rotate · ↓ soft drop · space hard drop
      </p>
    </div>
  );
}
