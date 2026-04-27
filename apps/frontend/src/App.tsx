import { useMemo, useState, type CSSProperties } from "react";
import "./App.css";
import { fetchTriviaQuestions } from "./api/triviaApi";
import type {
  AnswerResult,
  DifficultyOption,
  GameMode,
  GameSettings,
  TriviaQuestion,
  TriviaTypeOption,
} from "./types/trivia";
import { getPointsForDifficulty } from "./utils/scoring";

type Screen = "start" | "quiz" | "result";

const CATEGORIES = [
  { value: "any", label: "Any Category" },
  { value: "9", label: "General Knowledge" },
  { value: "10", label: "Entertainment: Books" },
  { value: "11", label: "Entertainment: Film" },
  { value: "12", label: "Entertainment: Music" },
  { value: "13", label: "Entertainment: Musicals & Theatres" },
  { value: "14", label: "Entertainment: Television" },
  { value: "15", label: "Entertainment: Video Games" },
  { value: "16", label: "Entertainment: Board Games" },
  { value: "17", label: "Science & Nature" },
  { value: "18", label: "Science: Computers" },
  { value: "19", label: "Science: Mathematics" },
  { value: "20", label: "Mythology" },
  { value: "21", label: "Sports" },
  { value: "22", label: "Geography" },
  { value: "23", label: "History" },
  { value: "24", label: "Politics" },
  { value: "25", label: "Art" },
  { value: "26", label: "Celebrities" },
  { value: "27", label: "Animals" },
  { value: "28", label: "Vehicles" },
  { value: "29", label: "Entertainment: Comics" },
  { value: "30", label: "Science: Gadgets" },
  { value: "31", label: "Entertainment: Japanese Anime & Manga" },
  { value: "32", label: "Entertainment: Cartoon & Animations" },
];

const INITIAL_SETTINGS: GameSettings = {
  mode: "random",
  amount: 10,
  categories: ["any"],
  difficulty: "any",
  type: "any",
};

function buildStats(
  answers: AnswerResult[],
  key: "difficulty" | "category"
): { label: string; correct: number; total: number; rate: number }[] {
  const stats: Record<string, { correct: number; total: number }> = {};

  for (const answer of answers) {
    const label = answer[key];

    if (!stats[label]) {
      stats[label] = {
        correct: 0,
        total: 0,
      };
    }

    stats[label].total += 1;

    if (answer.isCorrect) {
      stats[label].correct += 1;
    }
  }

  return Object.entries(stats).map(([label, value]) => ({
    label,
    correct: value.correct,
    total: value.total,
    rate: Math.round((value.correct / value.total) * 100),
  }));
}

function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [settings, setSettings] = useState<GameSettings>(INITIAL_SETTINGS);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerHistory, setAnswerHistory] = useState<AnswerResult[]>([]);
  const [score, setScore] = useState(0);
  const [floatingPoints, setFloatingPoints] = useState<number | null>(null);
  const [feedbackAnimation, setFeedbackAnimation] = useState<
    "correct" | "wrong" | null
  >(null);
  const [showWinPopover, setShowWinPopover] = useState(false);
  const [hasShownWinPopover, setHasShownWinPopover] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const currentQuestion = questions[currentQuestionIndex];

  const correctAnswersCount = answerHistory.filter(
    (answer) => answer.isCorrect
  ).length;

  const maxPossibleScore = questions.reduce(
    (total, question) => total + getPointsForDifficulty(question.difficulty),
    0
  );

  const progressPercent =
    questions.length === 0
      ? 0
      : ((currentQuestionIndex + 1) / questions.length) * 100;

  const winThreshold = Math.ceil(questions.length * 0.7);
  const didWin = correctAnswersCount >= winThreshold;

  const difficultyStats = useMemo(
    () => buildStats(answerHistory, "difficulty"),
    [answerHistory]
  );

  const categoryStats = useMemo(
    () => buildStats(answerHistory, "category"),
    [answerHistory]
  );

  function updateSettings<K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K]
  ) {
    setSettings((previousSettings) => ({
      ...previousSettings,
      [key]: value,
    }));
  }

  function toggleCategory(categoryValue: string) {
    setSettings((previousSettings) => {
      if (categoryValue === "any") {
        return {
          ...previousSettings,
          categories: ["any"],
        };
      }

      const categoriesWithoutAny = previousSettings.categories.filter(
        (category) => category !== "any"
      );

      const isAlreadySelected = categoriesWithoutAny.includes(categoryValue);

      if (isAlreadySelected) {
        const nextCategories = categoriesWithoutAny.filter(
          (category) => category !== categoryValue
        );

        return {
          ...previousSettings,
          categories: nextCategories.length > 0 ? nextCategories : ["any"],
        };
      }

      if (categoriesWithoutAny.length >= 3) {
        return previousSettings;
      }

      return {
        ...previousSettings,
        categories: [...categoriesWithoutAny, categoryValue],
      };
    });
  }

  async function startGame() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await fetchTriviaQuestions(settings);

      if (data.questions.length === 0) {
        throw new Error("No questions were returned. Try different settings.");
      }

      setQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setAnswerHistory([]);
      setScore(0);
      setFloatingPoints(null);
      setFeedbackAnimation(null);
      setShowWinPopover(false);
      setHasShownWinPopover(false);
      setScreen("quiz");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while starting the game.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleAnswerClick(answer: string) {
    if (!currentQuestion || selectedAnswer) {
      return;
    }

    const isCorrect = answer === currentQuestion.correctAnswer;
    const points = isCorrect
      ? getPointsForDifficulty(currentQuestion.difficulty)
      : 0;

    const nextCorrectAnswersCount = correctAnswersCount + (isCorrect ? 1 : 0);

    setSelectedAnswer(answer);
    setScore((previousScore) => previousScore + points);
    setFloatingPoints(points > 0 ? points : null);
    setFeedbackAnimation(isCorrect ? "correct" : "wrong");

    window.setTimeout(() => {
      setFloatingPoints(null);
    }, 900);

    window.setTimeout(() => {
      setFeedbackAnimation(null);
    }, 900);

    if (!hasShownWinPopover && nextCorrectAnswersCount >= winThreshold) {
      setShowWinPopover(true);
      setHasShownWinPopover(true);

      window.setTimeout(() => {
        setShowWinPopover(false);
      }, 2600);
    }

    setAnswerHistory((previousHistory) => [
      ...previousHistory,
      {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        selectedAnswer: answer,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
        difficulty: currentQuestion.difficulty,
        category: currentQuestion.category,
        points,
      },
    ]);
  }

  function goToNextQuestion() {
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    if (isLastQuestion) {
      setScreen("result");
      return;
    }

    setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
    setSelectedAnswer(null);
  }

  function restartGame() {
    setScreen("start");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswerHistory([]);
    setScore(0);
    setFloatingPoints(null);
    setFeedbackAnimation(null);
    setShowWinPopover(false);
    setHasShownWinPopover(false);
    setErrorMessage("");
  }

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">Student Health and Wellness</p>
        <h1>Trivia Challenge</h1>
        <p className="hero-text">
          Test your knowledge with random, progressive, or custom trivia games.
        </p>
      </section>

      {screen === "start" && (
        <section className="card start-card">
          <h2>Choose your game mode</h2>

          <div className="mode-grid">
            <button
              className={
                settings.mode === "random" ? "mode-card active" : "mode-card"
              }
              onClick={() => updateSettings("mode", "random")}
            >
              <strong>Random Mode</strong>
              <span>Any category, any difficulty, any question type.</span>
            </button>

            <button
              className={
                settings.mode === "progressive"
                  ? "mode-card active"
                  : "mode-card"
              }
              onClick={() => updateSettings("mode", "progressive")}
            >
              <strong>Progressive Mode</strong>
              <span>Difficulty is sorted from easy to hard.</span>
            </button>

            <button
              className={
                settings.mode === "custom" ? "mode-card active" : "mode-card"
              }
              onClick={() => updateSettings("mode", "custom")}
            >
              <strong>Custom Mode</strong>
              <span>Choose category, difficulty, and type.</span>
            </button>
          </div>

          <div className="form-grid">
            <label className="range-field">
              <div className="range-label-row">
                <span>Number of questions</span>
                <strong>{settings.amount}</strong>
              </div>

              <input
                className="question-range"
                type="range"
                min="5"
                max="50"
                step="1"
                value={settings.amount}
                style={
                  {
                    "--range-progress": `${((settings.amount - 5) / 45) * 100}%`,
                  } as CSSProperties
                }
                onChange={(event) =>
                  updateSettings("amount", Number(event.target.value))
                }
              />

              <div className="range-min-max">
                <span>5</span>
                <span>50</span>
              </div>
            </label>

            {settings.mode !== "random" && (
              <>
                <div className="category-group">
                  <p className="field-title">Categories</p>
                  <p className="small-helper">
                    Choose Any Category or select up to 3 specific categories.
                  </p>

                  <div className="checkbox-grid">
                    {CATEGORIES.map((category) => {
                      const isChecked = settings.categories.includes(category.value);

                      const selectedRealCategories = settings.categories.filter(
                        (value) => value !== "any"
                      );

                      const isDisabled =
                        category.value !== "any" &&
                        !isChecked &&
                        selectedRealCategories.length >= 3;

                      return (
                        <label className="checkbox-option" key={category.value}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isDisabled}
                            onChange={() => toggleCategory(category.value)}
                          />
                          <span>{category.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <label>
                  Question Type
                  <select
                    value={settings.type}
                    onChange={(event) =>
                      updateSettings(
                        "type",
                        event.target.value as TriviaTypeOption
                      )
                    }
                  >
                    <option value="any">Any Type</option>
                    <option value="multiple">Multiple Choice</option>
                    <option value="boolean">True / False</option>
                  </select>
                </label>
              </>
            )}

            {settings.mode === "custom" && (
              <label>
                Difficulty
                <select
                  value={settings.difficulty}
                  onChange={(event) =>
                    updateSettings(
                      "difficulty",
                      event.target.value as DifficultyOption
                    )
                  }
                >
                  <option value="any">Any Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>
            )}
          </div>

          {settings.mode === "progressive" && (
            <p className="helper-text">
              Progressive Mode lets you choose category and type, but the app
              controls the difficulty order: easy → medium → hard.
            </p>
          )}

          {settings.mode === "custom" && (
            <p className="helper-text">
              In Custom Mode, each option can still be left as Any/Random.
            </p>
          )}

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <button className="primary-button" onClick={startGame}>
            {isLoading ? "Loading questions..." : "Start Game"}
          </button>
        </section>
      )}

      {screen === "quiz" && currentQuestion && (
        <section className="card quiz-card question-transition" key={currentQuestion.id}>
          <div className="quiz-top-row">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="score-pill">Score: {score}</span>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="question-meta">
            <span className={`difficulty-badge ${currentQuestion.difficulty}`}>
              {currentQuestion.difficulty}
            </span>
            <span>{currentQuestion.category}</span>
          </div>

          <h2 className="question-text">{currentQuestion.question}</h2>

          {floatingPoints !== null && (
            <div className="floating-points">+{floatingPoints}</div>
          )}

          {feedbackAnimation && (
            <div className={`answer-pop ${feedbackAnimation}`}>
              {feedbackAnimation === "correct" ? "✓" : "×"}
            </div>
          )}

          {showWinPopover && (
            <div className="win-popover">
              <strong>Congratulations!</strong>
              <span>You reached the win condition.</span>
            </div>
          )}

          <div className="answers-grid">
            {currentQuestion.answers.map((answer) => {
              const isSelected = selectedAnswer === answer;
              const isCorrectAnswer = answer === currentQuestion.correctAnswer;

              let buttonClass = "answer-button";

              if (selectedAnswer) {
                if (isCorrectAnswer) {
                  buttonClass += " correct";
                } else if (isSelected) {
                  buttonClass += " wrong";
                }
              }

              return (
                <button
                  key={answer}
                  className={buttonClass}
                  onClick={() => handleAnswerClick(answer)}
                  disabled={Boolean(selectedAnswer)}
                >
                  {answer}
                </button>
              );
            })}
          </div>

          {selectedAnswer && (
            <div
              className={
                selectedAnswer === currentQuestion.correctAnswer
                  ? "feedback correct-feedback"
                  : "feedback wrong-feedback"
              }
            >
              {selectedAnswer === currentQuestion.correctAnswer ? (
                <>
                  Correct! You earned{" "}
                  {getPointsForDifficulty(currentQuestion.difficulty)} points.
                </>
              ) : (
                <>Not quite. The correct answer was: {currentQuestion.correctAnswer}</>
              )}
            </div>
          )}

          {selectedAnswer && (
            <button className="primary-button" onClick={goToNextQuestion}>
              {currentQuestionIndex === questions.length - 1
                ? "See Results"
                : "Next Question"}
            </button>
          )}
        </section>
      )}

      {screen === "result" && (
        <section className="card result-card">
          <p className="eyebrow">Game Complete</p>

          <h2>{didWin ? "Congratulations!" : "Good effort!"}</h2>

          <p className="result-summary">
            You got <strong>{correctAnswersCount}</strong> out of{" "}
            <strong>{questions.length}</strong> questions correct.
          </p>

          <p className="result-summary">
            Final score: <strong>{score}</strong> / {maxPossibleScore}
          </p>

          <p className="helper-text">
            Win condition: answer at least {winThreshold} out of{" "}
            {questions.length} questions correctly.
          </p>

          <div className="metrics-grid">
            <div>
              <h3>Difficulty success rate</h3>
              {difficultyStats.map((stat) => (
                <div className="metric-row" key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>
                    {stat.correct}/{stat.total} ({stat.rate}%)
                  </strong>
                </div>
              ))}
            </div>

            <div>
              <h3>Category success rate</h3>
              {categoryStats.map((stat) => (
                <div className="metric-row" key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>
                    {stat.correct}/{stat.total} ({stat.rate}%)
                  </strong>
                </div>
              ))}
            </div>
          </div>

          <button className="primary-button" onClick={restartGame}>
            Play Again
          </button>
        </section>
      )}
    </main>
  );
}

export default App;