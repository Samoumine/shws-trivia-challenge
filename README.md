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

- [x]  Displayed true/false questions with success feedback for correct answers
- [x]  Supported multiple questions in one game
- [x]  Supported multiple choice questions with success feedback
- [x]  Supported easy, medium, and hard difficulties
- [x]  Added a win condition with a congratulations message

### Stretch Achievements

- [x]  Added score tracking
- [x]  Made harder questions worth more points
  - Easy: 10 points
  - Medium: 20 points
  - Hard: 30 points
- [x]  Added category support, including multiple selected categories in Custom Mode
- [x]  Added animations for correct answers, incorrect answers, points earned, question transitions, and the win condition
- [x]  Added result metrics by difficulty and category success rates

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
