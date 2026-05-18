import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { getDailyTicker, getRandomTicker, getDailySeed, isValidTicker } from '../utils/tickers';
import { evaluateGuess, MAXATTEMPTS, WORDLENGTH } from '../utils/gameLogic';
import { getRandomHLPair } from '../utils/sp500';
import { getRandomCryptoPair } from '../utils/cryptoData';
import { getOrCreatePlayerId } from '../utils/identity';

const GameContext = createContext();

const STORAGEKEY = 'tickerdlestate';

function todayDateStr() {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

// Loads the daily streak from localStorage, resetting it if the player
// missed a calendar day (lastWonDate is more than 1 day ago).
function loadDailyStreak() {
  const saved      = parseInt(localStorage.getItem('tickerdle_dailyStreak') || '0', 10);
  const lastWon    = localStorage.getItem('tickerdle_lastWonDate') || null;
  const streak     = isNaN(saved) ? 0 : saved;
  if (!lastWon) return streak;
  const diffDays   = Math.round((Date.parse(todayDateStr()) - Date.parse(lastWon)) / 86400000);
  if (diffDays > 1) {
    localStorage.setItem('tickerdle_dailyStreak', '0');
    return 0;
  }
  return streak;
}

function getInitialState(mode = 'daily') {
  const saved = localStorage.getItem(STORAGEKEY);
  const playerName    = localStorage.getItem('tickerdle_playerName') || 'Anonymous';
  const soundEnabled  = localStorage.getItem('tickerdle_soundEnabled') !== 'false';
  const rawVolume     = parseFloat(localStorage.getItem('tickerdle_soundVolume'));
  const soundVolume   = isNaN(rawVolume) ? 0.5 : rawVolume;
  const chartStyle    = localStorage.getItem('tickerdle_chartStyle') || 'line';
  const showHowToPlay = localStorage.getItem('tickerdle_showHTP') !== 'false';
  const hintsEnabled  = localStorage.getItem('tickerdle_hintsEnabled') !== 'false';
  const soundSettings = { playerName, soundEnabled, soundVolume, chartStyle, showHowToPlay, hintsEnabled };

  if (saved) {
    const parsed = JSON.parse(saved);
    const currentSeed = getDailySeed();

    if (mode === 'daily' && parsed.mode === 'daily' && parsed.dailySeed !== currentSeed) {
      // New calendar day — start fresh. Daily streak lives in its own localStorage keys.
      return { ...createFreshState('daily'), ...soundSettings };
    }

    if (mode === 'endless' && parsed.mode === 'daily' && parsed.gameOver) {
      return { ...createFreshState('endless'), dailyState: parsed, ...soundSettings };
    }

    if (parsed.mode === mode) {
      return {
        ...parsed,
        ...soundSettings,
        scoreSubmitted: false,
        // ensure hint fields exist for saves that pre-date this feature
        hintUsed: parsed.hintUsed ?? false,
        revealedLetterPos: parsed.revealedLetterPos ?? null,
        revealedLetterChar: parsed.revealedLetterChar ?? null,
      };
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
  if (mode === 'higher-lower' || mode === 'crypto') {
    const pair = mode === 'crypto' ? getRandomCryptoPair() : getRandomHLPair();
    return {
      mode,
      hlCurrent: pair.first,
      hlNext: pair.second,
      hlStreak: 0,
      hlGuessed: null,
      hlGameOver: false,
      hlShowMarketCap: true,
      scoreSubmitted: false,
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
    dailyStreak: mode === 'daily' ? loadDailyStreak() : 0,
    usedTickers: mode === 'endless' ? [target] : [],
    scoreSubmitted: false,
    // Hint system
    hintUsed: false,
    revealedLetterPos: null,
    revealedLetterChar: null,
  };
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'ADDLETTER': {
      const targetLength = state.target ? state.target.length : WORDLENGTH;
      // When a letter is locked, the player fills (targetLength - 1) free positions
      const freeLen = state.revealedLetterPos !== null ? targetLength - 1 : targetLength;
      if (state.gameOver || state.currentGuess.length >= freeLen) {
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
      const rawGuess = state.currentGuess.toUpperCase();
      const targetLength = state.target ? state.target.length : WORDLENGTH;
      // When a letter is locked, the player only typed (targetLength - 1) free chars
      const freeLen = state.revealedLetterPos !== null ? targetLength - 1 : targetLength;

      if (state.gameOver || rawGuess.length !== freeLen) {
        return state;
      }

      // Reconstruct the full guess by inserting the locked letter at its position
      let guess = rawGuess;
      if (state.revealedLetterPos !== null && state.revealedLetterChar) {
        const arr = [];
        let freeIdx = 0;
        for (let i = 0; i < targetLength; i++) {
          if (i === state.revealedLetterPos) {
            arr.push(state.revealedLetterChar);
          } else {
            arr.push(rawGuess[freeIdx++] || '');
          }
        }
        guess = arr.join('');
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
        // Daily streak is managed by a provider effect (localStorage-based).
        // Only increment streak here for endless mode.
        streak: state.mode === 'endless' && won ? state.streak + 1 : state.streak,
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
        playerName: state.playerName,
        playerId: state.playerId,
        soundEnabled: state.soundEnabled,
        soundVolume: state.soundVolume,
        chartStyle: state.chartStyle,
        showHowToPlay: state.showHowToPlay,
      };
    }

    case 'MAKE_HL_GUESS': {
      if (state.hlGameOver) return state;

      const guess = action.guess;
      const isTie = state.hlNext.marketCap === state.hlCurrent.marketCap;
      const isCorrect = isTie ||
                        (guess === 'higher' && state.hlNext.marketCap > state.hlCurrent.marketCap) ||
                        (guess === 'lower'  && state.hlNext.marketCap < state.hlCurrent.marketCap);

      if (isCorrect) {
        const newCurrent = state.hlNext;
        const pair = state.mode === 'crypto'
          ? getRandomCryptoPair(newCurrent.symbol)
          : getRandomHLPair(newCurrent.symbol);
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

    case 'SET_DAILY_STREAK': {
      return { ...state, dailyStreak: action.dailyStreak };
    }

    case 'SET_SCORE_SUBMITTED': {
      return { ...state, scoreSubmitted: true };
    }

    case 'SET_PLAYER_NAME': {
      return { ...state, playerName: action.playerName };
    }

    case 'SET_SOUND_ENABLED': {
      return { ...state, soundEnabled: action.soundEnabled };
    }

    case 'SET_SOUND_VOLUME': {
      return { ...state, soundVolume: action.soundVolume };
    }

    case 'SET_CHART_STYLE': {
      return { ...state, chartStyle: action.chartStyle };
    }

    case 'SET_SHOW_HTP': {
      return { ...state, showHowToPlay: action.showHowToPlay };
    }

    case 'SET_HINTS_ENABLED': {
      return { ...state, hintsEnabled: action.hintsEnabled };
    }

    case 'USE_HINT': {
      return { ...state, hintUsed: true };
    }

    // Picks a random letter that hasn't been correctly placed yet and locks it.
    case 'COMPUTE_AND_REVEAL_LETTER': {
      if (state.revealedLetterPos !== null || !state.target) return state;
      const correctPositions = new Set();
      state.evaluations.forEach(row =>
        row.forEach((e, i) => { if (e === 'correct') correctPositions.add(i); })
      );
      const candidates = state.target
        .split('')
        .map((char, i) => ({ pos: i, char }))
        .filter(({ pos }) => !correctPositions.has(pos));
      if (candidates.length === 0) return state;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      return { ...state, revealedLetterPos: pick.pos, revealedLetterChar: pick.char };
    }

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, 'daily', getInitialState);

  // Stable player UUID — generated once on first visit, persists in localStorage
  const playerId = useRef(getOrCreatePlayerId()).current;

  useEffect(() => {
    localStorage.setItem(STORAGEKEY, JSON.stringify(state));
  }, [state]);

  // Daily streak — runs only on daily wins, never touches endless/HL.
  useEffect(() => {
    if (state.mode !== 'daily' || !state.gameOver || !state.won) return;
    const today = todayDateStr();
    const lastWon = localStorage.getItem('tickerdle_lastWonDate');
    if (lastWon === today) return; // already counted today's win
    const newStreak = state.dailyStreak + 1;
    localStorage.setItem('tickerdle_dailyStreak', String(newStreak));
    localStorage.setItem('tickerdle_lastWonDate', today);
    dispatch({ type: 'SET_DAILY_STREAK', dailyStreak: newStreak });
  }, [state.gameOver, state.won, state.mode]);

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

  const setHintsEnabled = useCallback((value) => {
    localStorage.setItem('tickerdle_hintsEnabled', value);
    dispatch({ type: 'SET_HINTS_ENABLED', hintsEnabled: value });
  }, []);

  const setScoreSubmitted = useCallback(() => {
    dispatch({ type: 'SET_SCORE_SUBMITTED' });
  }, []);

  const useHint = useCallback(() => {
    dispatch({ type: 'USE_HINT' });
  }, []);

  const revealLetter = useCallback(() => {
    dispatch({ type: 'COMPUTE_AND_REVEAL_LETTER' });
  }, []);

  useEffect(() => {
    if (state.hlGuessed !== null) {
      const timer = setTimeout(() => dispatch({ type: 'CLEAR_HL_GUESS' }), 1000);
      return () => clearTimeout(timer);
    }
  }, [state.hlGuessed]);

  const value = {
    ...state, // includes dailyStreak from state
    playerId,
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
    setHintsEnabled,
    setScoreSubmitted,
    useHint,
    revealLetter,
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
