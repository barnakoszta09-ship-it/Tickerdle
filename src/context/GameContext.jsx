import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { getDailyTicker, getRandomTicker, getDailySeed, isValidTicker } from '../utils/tickers';
import { evaluateGuess, MAXATTEMPTS, WORDLENGTH } from '../utils/gameLogic';

const GameContext = createContext();

const STORAGEKEY = 'tickerdlestate';

function getInitialState(mode = 'daily') {
  const saved = localStorage.getItem(STORAGEKEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    const currentSeed = getDailySeed();
    
    // If it's a new day in daily mode, reset
    if (mode === 'daily' && parsed.dailySeed !== currentSeed) {
      return createFreshState('daily');
    }
    
    // If switching to endless from a completed daily, keep daily but create endless
    if (mode === 'endless' && parsed.mode === 'daily' && parsed.gameOver) {
      return {
        ...createFreshState('endless'),
        dailyState: parsed,
      };
    }
    
    // Return saved state if mode matches
    if (parsed.mode === mode) {
      return parsed;
    }
    
    // Return saved state with mode switch data
    if (parsed.mode === 'daily' && mode === 'endless' && parsed.endlessState) {
      return parsed.endlessState;
    }
    if (parsed.mode === 'endless' && mode === 'daily' && parsed.dailyState) {
      return parsed.dailyState;
    }
  }
  
  return createFreshState(mode);
}

function createFreshState(mode) {
  const target = mode === 'daily' ? getDailyTicker() : getRandomTicker();
  return {
    mode,
    target,
    guesses: [],
    evaluations: [],
    currentGuess: '',
    gameOver: false,
    won: false,
    shake: false,
    revealRow: null,
    dailySeed: mode === 'daily' ? getDailySeed() : null,
    streak: 0,
    usedTickers: mode === 'endless' ? [target] : [],
  };
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'ADDLETTER': {
      if (state.gameOver || state.currentGuess.length >= WORDLENGTH) {
        return state;
      }
      return {
        ...state,
        currentGuess: state.currentGuess + action.letter,
      };
    }

    case 'DELETELETTER': {
      if (state.gameOver || state.currentGuess.length === 0) {
        return state;
      }
      return {
        ...state,
        currentGuess: state.currentGuess.slice(0, -1),
      };
    }

    case 'SUBMITGUESS': {
      const guess = state.currentGuess.toUpperCase();
      
      if (state.gameOver || guess.length !== WORDLENGTH) {
        return state;
      }

      if (!isValidTicker(guess)) {
        return { ...state, shake: true };
      }

      const evaluation = evaluateGuess(guess, state.target);
      const newGuesses = [...state.guesses, guess];
      const newEvaluations = [...state.evaluations, evaluation];
      const won = guess === state.target;
      const gameOver = won || newGuesses.length >= MAXATTEMPTS;

      return {
        ...state,
        guesses: newGuesses,
        evaluations: newEvaluations,
        currentGuess: '',
        gameOver,
        won,
        revealRow: newGuesses.length - 1,
        streak: won ? state.streak + 1 : state.streak,
      };
    }

    case 'CLEARSHAKE': {
      return { ...state, shake: false };
    }

    case 'CLEARREVEAL': {
      return { ...state, revealRow: null };
    }

    case 'SWITCHMODE': {
      return getInitialState(action.mode);
    }

    case 'NEWENDLESSGAME': {
      const newTarget = getRandomTicker(state.usedTickers);
      return {
        ...createFreshState('endless'),
        streak: state.won ? state.streak : 0,
        usedTickers: [...state.usedTickers, newTarget],
        target: newTarget,
      };
    }

    case 'RESETGAME': {
      return createFreshState(state.mode);
    }

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, 'daily', getInitialState);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGEKEY, JSON.stringify(state));
  }, [state]);

  // Clear shake after animation
  useEffect(() => {
    if (state.shake) {
      const timer = setTimeout(() => dispatch({ type: 'CLEARSHAKE' }), 500);
      return () => clearTimeout(timer);
    }
  }, [state.shake]);

  // Clear reveal after animation
  useEffect(() => {
    if (state.revealRow !== null) {
      const timer = setTimeout(() => dispatch({ type: 'CLEARREVEAL' }), 2000);
      return () => clearTimeout(timer);
    }
  }, [state.revealRow]);

  const addLetter = useCallback((letter) => {
    dispatch({ type: 'ADDLETTER', letter: letter.toUpperCase() });
  }, []);

  const deleteLetter = useCallback(() => {
    dispatch({ type: 'DELETELETTER' });
  }, []);

  const submitGuess = useCallback(() => {
    dispatch({ type: 'SUBMITGUESS' });
  }, []);

  const switchMode = useCallback((mode) => {
    dispatch({ type: 'SWITCHMODE', mode });
  }, []);

  const newEndlessGame = useCallback(() => {
    dispatch({ type: 'NEWENDLESSGAME' });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESETGAME' });
  }, []);

  const value = {
    ...state,
    addLetter,
    deleteLetter,
    submitGuess,
    switchMode,
    newEndlessGame,
    resetGame,
    puzzleNumber: getDailySeed(),
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
