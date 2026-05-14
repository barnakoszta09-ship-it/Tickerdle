# Tickerdle

A minimalist, Bloomberg-terminal-inspired Wordle clone for stock tickers. Guess the 4-letter ticker symbol in 6 attempts with daily and endless modes.

## Features

- **Daily Mode** — Same ticker for everyone each day, seeded by date
- **Endless Mode** — Random tickers with streak tracking
- **Full Wordle Mechanics** — Green (correct), yellow (wrong position), gray (wrong letter) feedback
- **Physical + On-Screen Keyboard** — With state highlighting
- **Smooth Animations** — Tile flip on reveal, shake on invalid guess, bounce on win
- **Share Results** — Generates emoji grid for social sharing
- **Mobile-First** — Touch-friendly, responsive, no-scroll layout
- **Dark Terminal Aesthetic** — Bloomberg-inspired design
- **LocalStorage Persistence** — Progress saves automatically

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **React 18.2** — UI framework
- **Vite 5.1** — Build tool
- **Tailwind CSS 3.4** — Styling
- **React Context API** — State management

## Project Structure

```
src/
├── components/        # React components
├── context/          # Game context and state
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
├── App.jsx           # Main app component
├── main.jsx          # Entry point
└── index.css         # Global styles
```

## Customization

The ticker list includes ~300 real symbols across tech, finance, biotech, and ETFs. You can:
- Swap in your own ticker list in `src/utils/tickers.js`
- Connect to a live API for validation
- Modify colors in `tailwind.config.js`
- Adjust game constants in `src/utils/gameLogic.js`

## License

MIT
"# Tickerdle" 
