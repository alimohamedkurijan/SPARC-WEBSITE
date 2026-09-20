import type { ComponentType } from "react";
import AIvsReal from "@/components/games/AIvsReal";
import RobotPath from "@/components/games/RobotPath";
import CircuitConnect from "@/components/games/CircuitConnect";

// Games registry
// -----------------------------------------------------------------------------
// Add a new game by dropping an entry into the `games` array below.
// - Give it a unique `slug`, a `title`, `description`, and an `emoji`.
// - When you have the actual game built, point `component` at the React
//   component that renders it. Until then, leave `component` undefined and the
//   card will show as "Coming soon".
//
// Example:
//   import SnakeGame from "@/components/games/SnakeGame";
//   { slug: "snake", title: "SPARC Snake", description: "Classic snake.",
//     emoji: "🐍", component: SnakeGame }
// -----------------------------------------------------------------------------

export interface Game {
  slug: string;
  title: string;
  description: string;
  emoji: string;
  /** Rendered inside the player when the user clicks "Play". */
  component?: ComponentType;
}

export const games: Game[] = [
  {
    slug: "ai-vs-real",
    title: "AI vs Real",
    description:
      "Watch a clip and decide: AI-generated or real footage? Get 6 of 8 right to win.",
    emoji: "🤖",
    component: AIvsReal,
  },
  {
    slug: "robot-path",
    title: "Robot Path",
    description:
      "Program a robot to reach the goal on a 16×16 grid. Queue moves, dodge walls, clear 5 levels.",
    emoji: "🎯",
    component: RobotPath,
  },
  {
    slug: "circuit-connect",
    title: "Circuit Connect",
    description:
      "Rotate the wires to route power from the battery to the goal. 5 levels, easy to hard.",
    emoji: "⚡",
    component: CircuitConnect,
  },
];
