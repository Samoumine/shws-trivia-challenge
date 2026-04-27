import type { Difficulty } from "../types/trivia";

export function getPointsForDifficulty(difficulty: Difficulty): number {
  if (difficulty === "easy") {
    return 10;
  }

  if (difficulty === "medium") {
    return 20;
  }

  return 30;
}