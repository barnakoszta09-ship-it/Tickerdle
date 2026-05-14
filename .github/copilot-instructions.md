# Tickerdle Project Instructions

## Project Overview
Tickerdle is a minimalist, Bloomberg-terminal-inspired Wordle clone for stock tickers. It features a dark terminal aesthetic with a curated list of ~300 real stock symbols.

## Technology Stack
- **Framework**: React 18.2
- **Build Tool**: Vite 5.1
- **Styling**: Tailwind CSS 3.4
- **State Management**: React Context API with useReducer

## Key Features
- Daily mode with date-based seeding (same ticker for all users each day)
- Endless mode with streak tracking
- Full Wordle mechanics (green/yellow/gray feedback with proper letter-frequency handling)
- Physical + on-screen keyboard with state highlighting
- Tile flip animations on reveal, shake on invalid guess, bounce on win
- Share results with emoji grid generation
- Mobile-first responsive design
- LocalStorage persistence
- Dark terminal aesthetic with muted colors

## Project Structure
```
tickerdle/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx
│   ├── index.css
│   ├── App.jsx
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── context/
```

## Development Commands
- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Notes
- Ticker list can be customized or connected to a live API for validation
- All game state is persisted to localStorage
- Mobile viewport is optimized with no-scroll layout
