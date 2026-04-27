import type { GameSettings, QuestionsResponse } from "../types/trivia";

export async function fetchTriviaQuestions(
  settings: GameSettings
): Promise<QuestionsResponse> {
  const params = new URLSearchParams();

  params.set("amount", String(settings.amount));
  params.set("mode", settings.mode);

  if (!settings.categories.includes("any")) {
    params.set("categories", settings.categories.join(","));
  }

  if (settings.difficulty !== "any") {
    params.set("difficulty", settings.difficulty);
  }

  if (settings.type !== "any") {
    params.set("type", settings.type);
  }

  const response = await fetch(`/api/questions?${params.toString()}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to load trivia questions.");
  }

  return data;
}