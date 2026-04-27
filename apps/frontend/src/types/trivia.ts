export type GameMode = "random" | "progressive" | "custom";

export type Difficulty = "easy" | "medium" | "hard";
export type DifficultyOption = "any" | Difficulty;

export type TriviaType = "multiple" | "boolean";
export type TriviaTypeOption = "any" | TriviaType;

export type TriviaQuestion = {
  id: string;
  category: string;
  type: TriviaType;
  difficulty: Difficulty;
  question: string;
  correctAnswer: string;
  answers: string[];
};

export type QuestionsResponse = {
  mode: GameMode;
  count: number;
  questions: TriviaQuestion[];
};

export type GameSettings = {
  mode: GameMode;
  amount: number;
  categories: string[];
  difficulty: DifficultyOption;
  type: TriviaTypeOption;
};

export type AnswerResult = {
  questionId: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  difficulty: Difficulty;
  category: string;
  points: number;
};