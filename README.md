# Student Health and Wellness Trivia Challenge

A trivia web application built for the Student Health and Wellness Summer 2026 coding challenge.

The app uses a Next.js backend to fetch and normalize questions from the Open Trivia Database API, and a React + Vite frontend for the game experience.

## Tech Stack

- Backend: Next.js
- Frontend: React + Vite
- Language: TypeScript
- API: Open Trivia Database

## Completed Achievements

### Main Achievements

- Displayed true/false questions with success feedback for correct answers
- Supported multiple questions in one game
- Supported multiple choice questions with success feedback
- Supported easy, medium, and hard difficulties
- Added a win condition with a congratulations message

### Stretch Achievements

- Added score tracking
- Made harder questions worth more points
  - Easy: 10 points
  - Medium: 20 points
  - Hard: 30 points
- Added category support, including multiple selected categories in Custom Mode
- Added animations for correct answers, incorrect answers, points earned, question transitions, and the win condition
- Added result metrics by difficulty and category success rates

## Game Modes

- Random Mode: random category, difficulty, and question type
- Progressive Mode: questions are ordered from easier to harder when possible
- Custom Mode: user can choose categories, difficulty, question type, and number of questions

## How to Run

### Backend

```bash
cd apps/backend
npm install
npm run dev
```

Backend runs on:

```txt
http://localhost:3000
```

### Frontend

```bash
cd apps/frontend
npm install
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

## Notes

The frontend calls the Next.js backend instead of calling Open Trivia Database directly. The backend handles API errors, decoding, answer shuffling, and response formatting.
