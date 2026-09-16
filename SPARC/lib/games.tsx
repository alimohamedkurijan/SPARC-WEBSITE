import type { ComponentType } from "react";
import AIvsReal from "@/components/games/AIvsReal";

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
];
