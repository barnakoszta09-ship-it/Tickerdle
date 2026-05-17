import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { getDailyTicker, getRandomTicker, getDailySeed, isValidTicker } from '../utils/tickers';
import { evaluateGuess, MAXATTEMPTS, WORDLENGTH } from '../utils/gameLogic';
import { getRandomHLPair } from '../utils/sp500';
import { saveScore } from '../utils/leaderboard';

const GameContext = createContext();

const STORAGEKEY = 'tickerdlestate';

function getInitialState(mode = 'daily') {
  const saved = localStorage.getItem(STORAGEKEY);
  const playerName = localStorage.getItem('tickerdle_playerName') || 'Anonymous';
  const soundEnabled = localStorage.getItem('tickerdle_soundEnabled') !== 'false';
  const rawVolume = parseFloat(localStorage.getItem('tickerdle_soundVolume'));
  const soundVolume = isNaN(rawVolume) ? 0.5 : rawVolume;
  const chartStyle    = localStorage.getItem('tickerdle_chartStyle') || 'line';
  const showHowToPlay = localStorage.getItem('tickerdle_showHTP') !== 'false';
  const soundSettings = { playerName, soundEnabled, soundVolume, chartStyle, showHowToPlay };

  if (saved) {
    const parsed = JSON.parse(saved);
    const currentSeed = getDailySeed();

    if (mode === 'daily' && parsed.mode === 'daily' && parsed.dailySeed !== currentSeed) {
      return { ...createFreshState('daily'), ...soundSettings };
    }

    if (mode === 'endless' && parsed.mode === 'daily' && parsed.gameOver) {
      return { ...createFreshState('endless'), dailyState: parsed, ...soundSettings };
    }

    if (parsed.mode === mode) {
      return { ...parsed, ...soundSettings };
    }

    if (parsed.mode === 'daily' && mode === 'endless' && parsed.endlessState) {
      return { ...parsed.endlessState, ...soundSettings };
    }
    if (parsed.mode === 'endless' && mode === 'daily' && parsed.dailyState) {
      return { ...parsed.dailyState, ...soundSettings };
    }
  }

  return { ...createFreshState(mode), ...soundSettings };
}

function createFreshState(mode) {
  if (mode === 'higher-lower') {
    const pair = getRandomHLPair();
    return {
      mode,
      hlCurrent: pair.first,
      hlNext: pair.second,
      hlStreak: 0,
      hlGuessed: null,
      hlGameOver: false,
      hlShowMarketCap: true,
    };
  }

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
      const targetLength = state.target ? state.target.length : WORDLENGTH;
      if (state.gameOver || state.currentGuess.length >= targetLength) {
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
      const targetLength = state.target ? state.target.length : WORDLENGTH;

      if (state.gameOver || guess.length !== targetLength) {
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
        soundEnabled: state.soundEnabled,
        soundVolume: state.soundVolume,
      };
    }

    case 'RESETGAME': {
      return {
        ...createFreshState(state.mode),
        soundEnabled: state.soundEnabled,
        soundVolume: state.soundVolume,
      };
    }

    case 'MAKE_HL_GUESS': {
      if (state.hlGameOver) return state;

      const guess = action.guess;
      const isCorrect = (guess === 'higher' && state.hlNext.marketCap > state.hlCurrent.marketCap) ||
                        (guess === 'lower' && state.hlNext.marketCap < state.hlCurrent.marketCap);

      if (isCorrect) {
        const newCurrent = state.hlNext;
        const pair = getRandomHLPair(newCurrent.symbol);
        return {
          ...state,
          hlCurrent: newCurrent,
          hlNext: pair.second,
          hlStreak: state.hlStreak + 1,
          hlGuessed: true,
          hlShowMarketCap: false,
        };
      } else {
        return {
          ...state,
          hlGameOver: true,
          hlGuessed: false,
        };
      }
    }

    case 'CLEAR_HL_GUESS': {
      return {
        ...state,
        hlGuessed: null,
        hlShowMarketCap: true,
      };
    }

    case 'SET_PLAYER_NAME': {
      return {
        ...state,
        playerName: action.playerName,
      };
    }

    case 'SET_SOUND_ENABLED': {
      return {
        ...state,
        soundEnabled: action.soundEnabled,
      };
    }

    case 'SET_SOUND_VOLUME': {
      return {
        ...state,
        soundVolume: action.soundVolume,
      };
    }

    case 'SET_CHART_STYLE': {
      return {
        ...state,
        chartStyle: action.chartStyle,
      };
    }

    case 'SET_SHOW_HTP': {
      return {
        ...state,
        showHowToPlay: action.showHowToPlay,
      };
    }

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, 'daily', getInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGEKEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.shake) {
      const timer = setTimeout(() => dispatch({ type: 'CLEARSHAKE' }), 500);
      return () => clearTimeout(timer);
    }
  }, [state.shake]);

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

  const makeHLGuess = useCallback((guess) => {
    dispatch({ type: 'MAKE_HL_GUESS', guess });
  }, []);

  const setPlayerName = useCallback((name) => {
    localStorage.setItem('tickerdle_playerName', name);
    dispatch({ type: 'SET_PLAYER_NAME', playerName: name });
  }, []);

  const setSoundEnabled = useCallback((enabled) => {
    localStorage.setItem('tickerdle_soundEnabled', enabled);
    dispatch({ type: 'SET_SOUND_ENABLED', soundEnabled: enabled });
  }, []);

  const setSoundVolume = useCallback((volume) => {
    localStorage.setItem('tickerdle_soundVolume', volume);
    dispatch({ type: 'SET_SOUND_VOLUME', soundVolume: volume });
  }, []);

  const setChartStyle = useCallback((style) => {
    localStorage.setItem('tickerdle_chartStyle', style);
    dispatch({ type: 'SET_CHART_STYLE', chartStyle: style });
  }, []);

  const setShowHowToPlay = useCallback((value) => {
    localStorage.setItem('tickerdle_showHTP', value);
    dispatch({ type: 'SET_SHOW_HTP', showHowToPlay: value });
  }, []);

  useEffect(() => {
    if (state.hlGuessed !== null) {
      const timer = setTimeout(() => dispatch({ type: 'CLEAR_HL_GUESS' }), 1000);
      return () => clearTimeout(timer);
    }
  }, [state.hlGuessed]);

  const value = {
    ...state,
    addLetter,
    deleteLetter,
    submitGuess,
    switchMode,
    newEndlessGame,
    resetGame,
    makeHLGuess,
    setPlayerName,
    setSoundEnabled,
    setSoundVolume,
    setChartStyle,
    setShowHowToPlay,
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
