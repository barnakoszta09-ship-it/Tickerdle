import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { getDailySeed } from '../utils/tickers';
import { MAXATTEMPTS, WORDLENGTH } from '../utils/gameLogic';
import { getRandomHLPair } from '../utils/sp500';
import { getRandomCryptoPair } from '../utils/cryptoData';
import { getRandomMixedPair }  from '../utils/mixedHLData';
import { getOrCreatePlayerId } from '../utils/identity';

const GameContext = createContext();

const STORAGEKEY = 'tickerdlestate';
const API        = '';   // same origin

function todayDateStr() {
  return new Date().toISOString().slice(0, 10);
}

function loadDailyStreak() {
  const saved   = parseInt(localStorage.getItem('tickerdle_dailyStreak') || '0', 10);
  const lastWon = localStorage.getItem('tickerdle_lastWonDate') || null;
  const streak  = isNaN(saved) ? 0 : saved;
  if (!lastWon) return streak;
  const diff = Math.round((Date.parse(todayDateStr()) - Date.parse(lastWon)) / 86400000);
  if (diff > 1) { localStorage.setItem('tickerdle_dailyStreak', '0'); return 0; }
  return streak;
}

function loadSettings() {
  return {
    playerName:    localStorage.getItem('tickerdle_playerName') || 'Anonymous',
    soundEnabled:  localStorage.getItem('tickerdle_soundEnabled') !== 'false',
    soundVolume:   (() => { const v = parseFloat(localStorage.getItem('tickerdle_soundVolume')); return isNaN(v) ? 0.5 : v; })(),
    chartStyle:    localStorage.getItem('tickerdle_chartStyle') || 'line',
    showHowToPlay: localStorage.getItem('tickerdle_showHTP') !== 'false',
    hintsEnabled:  localStorage.getItem('tickerdle_hintsEnabled') !== 'false',
  };
}

// ── Fresh state builders ────────────────────────────────────────────────────

function createFreshHLState(mode) {
  const pair = mode === 'crypto'    ? getRandomCryptoPair()
             : mode === 'mixed-hl' ? getRandomMixedPair()
             : getRandomHLPair();
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

function createFreshWordleState(mode) {
  return {
    mode,
    // Target is NEVER stored client-side until game over — set by server init
    target:           null,
    targetLength:     null,
    sessionId:        null,
    guesses:          [],
    evaluations:      [],
    currentGuess:     '',
    gameOver:         false,
    won:              false,
    shake:            false,
    revealRow:        null,
    dailySeed:        mode === 'daily' ? getDailySeed() : null,
    streak:           0,
    dailyStreak:      mode === 'daily' ? loadDailyStreak() : 0,
    scoreSubmitted:   false,
    hintUsed:         false,
    hintMetadata:     null,
    revealedLetterPos:  null,
    revealedLetterChar: null,
  };
}

function getInitialState(mode = 'daily') {
  const saved    = localStorage.getItem(STORAGEKEY);
  const settings = loadSettings();

  if (saved) {
    const parsed = JSON.parse(saved);
    const currentSeed = getDailySeed();

    // HL modes — no server interaction, keep as-is
    if ((mode === 'higher-lower' || mode === 'crypto' || mode === 'mixed-hl') && parsed.mode === mode) {
      return { ...parsed, ...settings, scoreSubmitted: false };
    }

    // New calendar day → fresh daily
    if (mode === 'daily' && parsed.mode === 'daily' && parsed.dailySeed !== currentSeed) {
      return { ...createFreshWordleState('daily'), ...settings };
    }

    if (parsed.mode === mode && (mode === 'daily' || mode === 'endless')) {
      return {
        ...parsed,
        ...settings,
        // ── Security: never restore target before game is over ──────────
        target:       parsed.gameOver ? (parsed.target ?? null) : null,
        targetLength: parsed.targetLength ?? (parsed.target ? parsed.target.length : null),
        sessionId:    parsed.sessionId ?? null,
        hintMetadata: parsed.hintMetadata ?? null,
        scoreSubmitted: false,
        hintUsed: parsed.hintUsed ?? false,
        revealedLetterPos:  parsed.revealedLetterPos ?? null,
        revealedLetterChar: parsed.revealedLetterChar ?? null,
      };
    }

    // Cross-mode switch fallback
    if (parsed.mode === 'daily' && mode === 'endless' && parsed.endlessState) {
      return { ...parsed.endlessState, ...settings };
    }
    if (parsed.mode === 'endless' && mode === 'daily' && parsed.dailyState) {
      return { ...parsed.dailyState, ...settings };
    }
  }

  const isHL = mode === 'higher-lower' || mode === 'crypto' || mode === 'mixed-hl';
  return { ...(isHL ? createFreshHLState(mode) : createFreshWordleState(mode)), ...settings };
}

// ── Reducer ─────────────────────────────────────────────────────────────────

function gameReducer(state, action) {
  switch (action.type) {

    // ── Async game result (replaces old SUBMITGUESS) ─────────────────────
    case 'GUESS_RESULT': {
      const newGuesses     = [...state.guesses, action.guess];
      const newEvaluations = [...state.evaluations, action.evaluation];
      return {
        ...state,
        guesses:      newGuesses,
        evaluations:  newEvaluations,
        currentGuess: '',
        gameOver:     action.gameOver,
        won:          action.won,
        revealRow:    newGuesses.length - 1,
        streak: state.mode === 'endless' && action.won ? state.streak + 1 : state.streak,
        hintMetadata: action.hintMetadata ?? state.hintMetadata,
      };
    }

    // ── Server game init (daily load / endless new+restore) ──────────────
    case 'GAME_INIT': {
      return {
        ...state,
        mode:         action.mode,
        targetLength: action.targetLength,
        sessionId:    action.sessionId ?? null,
        target:       action.gameOver ? (action.target ?? null) : null,
        guesses:      action.guesses      ?? [],
        evaluations:  action.evaluations  ?? [],
        currentGuess: '',
        gameOver:     action.gameOver  ?? false,
        won:          action.won       ?? false,
        shake:        false,
        revealRow:    null,
        scoreSubmitted: false,
        hintUsed:     false,
        hintMetadata: action.hintMetadata ?? null,
        revealedLetterPos:  null,
        revealedLetterChar: null,
        streak:       action.streak !== undefined ? action.streak : state.streak,
        dailySeed:    action.mode === 'daily' ? getDailySeed() : state.dailySeed,
        dailyStreak:  action.dailyStreak !== undefined ? action.dailyStreak : state.dailyStreak,
      };
    }

    case 'SET_TARGET': {
      return { ...state, target: action.target };
    }

    case 'SET_HINT_METADATA': {
      return { ...state, hintMetadata: action.hintMetadata };
    }

    case 'SET_REVEALED_LETTER': {
      return {
        ...state,
        hintUsed:           true,
        revealedLetterPos:  action.pos,
        revealedLetterChar: action.char,
      };
    }

    // ── Keyboard input ───────────────────────────────────────────────────
    case 'ADDLETTER': {
      const tLen    = state.targetLength ?? WORDLENGTH;
      const freeLen = state.revealedLetterPos !== null ? tLen - 1 : tLen;
      if (state.gameOver || state.currentGuess.length >= freeLen) return state;
      return { ...state, currentGuess: state.currentGuess + action.letter };
    }

    case 'DELETELETTER': {
      if (state.gameOver || state.currentGuess.length === 0) return state;
      return { ...state, currentGuess: state.currentGuess.slice(0, -1) };
    }

    case 'SHAKE': {
      return { ...state, shake: true };
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

    case 'RESETGAME': {
      // Used by H/L "Play Again" — wordle modes use initGame() instead
      return {
        ...createFreshHLState(state.mode),
        playerName:    state.playerName,
        playerId:      state.playerId,
        soundEnabled:  state.soundEnabled,
        soundVolume:   state.soundVolume,
        chartStyle:    state.chartStyle,
        showHowToPlay: state.showHowToPlay,
        hintsEnabled:  state.hintsEnabled,
      };
    }

    // ── Higher/Lower ─────────────────────────────────────────────────────
    case 'MAKE_HL_GUESS': {
      if (state.hlGameOver) return state;
      const guess     = action.guess;
      const isTie     = state.hlNext.marketCap === state.hlCurrent.marketCap;
      const isCorrect = isTie ||
        (guess === 'higher' && state.hlNext.marketCap > state.hlCurrent.marketCap) ||
        (guess === 'lower'  && state.hlNext.marketCap < state.hlCurrent.marketCap);

      if (isCorrect) {
        const newCurrent = state.hlNext;
        const pair = state.mode === 'crypto'    ? getRandomCryptoPair(newCurrent.symbol)
                   : state.mode === 'mixed-hl' ? getRandomMixedPair(newCurrent.symbol)
                   : getRandomHLPair(newCurrent.symbol);
        return { ...state, hlCurrent: newCurrent, hlNext: pair.second,
                 hlStreak: state.hlStreak + 1, hlGuessed: true, hlShowMarketCap: false };
      }
      return { ...state, hlGameOver: true, hlGuessed: false };
    }

    case 'CLEAR_HL_GUESS': {
      return { ...state, hlGuessed: null, hlShowMarketCap: true };
    }

    // ── Daily streak ─────────────────────────────────────────────────────
    case 'SET_DAILY_STREAK': {
      return { ...state, dailyStreak: action.dailyStreak };
    }

    // ── Settings ─────────────────────────────────────────────────────────
    case 'SET_SCORE_SUBMITTED':  return { ...state, scoreSubmitted: true };
    case 'SET_PLAYER_NAME':      return { ...state, playerName:    action.playerName };
    case 'SET_SOUND_ENABLED':    return { ...state, soundEnabled:  action.soundEnabled };
    case 'SET_SOUND_VOLUME':     return { ...state, soundVolume:   action.soundVolume };
    case 'SET_CHART_STYLE':      return { ...state, chartStyle:    action.chartStyle };
    case 'SET_SHOW_HTP':         return { ...state, showHowToPlay: action.showHowToPlay };
    case 'SET_HINTS_ENABLED':    return { ...state, hintsEnabled:  action.hintsEnabled };
    case 'USE_HINT':             return { ...state, hintUsed: true };

    default: return state;
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, 'daily', getInitialState);
  const playerId = useRef(getOrCreatePlayerId()).current;

  // Always-current state ref for async callbacks
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Persist state (never include target if game is not over)
  useEffect(() => {
    const toSave = state.gameOver
      ? state
      : { ...state, target: null };   // keep target hidden in storage
    localStorage.setItem(STORAGEKEY, JSON.stringify(toSave));
  }, [state]);

  // ── Daily streak effect ──────────────────────────────────────────────────
  useEffect(() => {
    if (state.mode !== 'daily' || !state.gameOver || !state.won) return;
    const today   = todayDateStr();
    const lastWon = localStorage.getItem('tickerdle_lastWonDate');
    if (lastWon === today) return;
    const newStreak = state.dailyStreak + 1;
    localStorage.setItem('tickerdle_dailyStreak', String(newStreak));
    localStorage.setItem('tickerdle_lastWonDate', today);
    dispatch({ type: 'SET_DAILY_STREAK', dailyStreak: newStreak });
  }, [state.gameOver, state.won, state.mode]);

  // ── Shake / reveal timers ────────────────────────────────────────────────
  useEffect(() => {
    if (state.shake) {
      const t = setTimeout(() => dispatch({ type: 'CLEARSHAKE' }), 500);
      return () => clearTimeout(t);
    }
  }, [state.shake]);

  useEffect(() => {
    if (state.revealRow !== null) {
      const t = setTimeout(() => dispatch({ type: 'CLEARREVEAL' }), 2000);
      return () => clearTimeout(t);
    }
  }, [state.revealRow]);

  useEffect(() => {
    if (state.hlGuessed !== null) {
      const t = setTimeout(() => dispatch({ type: 'CLEAR_HL_GUESS' }), 1000);
      return () => clearTimeout(t);
    }
  }, [state.hlGuessed]);

  // ── Server init: runs whenever mode switches to a wordle mode ────────────
  const initGame = useCallback(async (mode) => {
    if (mode !== 'daily' && mode !== 'endless') return;
    try {
      if (mode === 'daily') {
        const res  = await fetch(`${API}/api/daily?playerId=${encodeURIComponent(playerId)}`);
        const data = await res.json();
        dispatch({
          type:         'GAME_INIT',
          mode:         'daily',
          targetLength: data.length,
          guesses:      data.guesses      ?? [],
          evaluations:  data.evaluations  ?? [],
          gameOver:     data.gameOver,
          won:          data.won,
          hintMetadata: data.hintMetadata ?? null,
          dailyStreak:  loadDailyStreak(),
        });
        if (data.gameOver) {
          const rv = await fetch(`${API}/api/reveal?mode=daily&playerId=${encodeURIComponent(playerId)}`);
          if (rv.ok) {
            const { ticker } = await rv.json();
            dispatch({ type: 'SET_TARGET', target: ticker });
          }
        }
      } else {
        // Endless — try restoring existing session first
        const s = stateRef.current;
        if (s.sessionId) {
          const rv = await fetch(`${API}/api/endless/state?sessionId=${s.sessionId}`);
          if (rv.ok) {
            const data = await rv.json();
            dispatch({
              type:         'GAME_INIT',
              mode:         'endless',
              sessionId:    s.sessionId,
              targetLength: data.length,
              guesses:      data.guesses      ?? [],
              evaluations:  data.evaluations  ?? [],
              gameOver:     data.gameOver,
              won:          data.won,
              hintMetadata: data.hintMetadata ?? null,
              target:       data.ticker ?? null,
            });
            return;
          }
        }
        // No valid session — start fresh
        const res  = await fetch(`${API}/api/endless/new`);
        const data = await res.json();
        dispatch({
          type:         'GAME_INIT',
          mode:         'endless',
          sessionId:    data.sessionId,
          targetLength: data.length,
          guesses:      [],
          evaluations:  [],
          gameOver:     false,
          won:          false,
        });
      }
    } catch (err) {
      console.error('[initGame]', err);
    }
  }, [playerId]);

  useEffect(() => {
    if (state.mode === 'daily' || state.mode === 'endless') {
      initGame(state.mode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.mode]);

  // ── Submit guess (async — calls /api/evaluate) ───────────────────────────
  const submitGuess = useCallback(async () => {
    const s = stateRef.current;
    const { currentGuess, revealedLetterPos, revealedLetterChar,
            targetLength, mode, sessionId, gameOver } = s;

    if (gameOver || !targetLength) return;

    const freeLen = revealedLetterPos !== null ? targetLength - 1 : targetLength;
    const raw     = currentGuess.toUpperCase();
    if (raw.length !== freeLen) return;

    // Reconstruct full guess with locked letter
    let guess = raw;
    if (revealedLetterPos !== null && revealedLetterChar) {
      const arr = [];
      let fi = 0;
      for (let i = 0; i < targetLength; i++) {
        arr.push(i === revealedLetterPos ? revealedLetterChar : (raw[fi++] || ''));
      }
      guess = arr.join('');
    }

    try {
      const body = { mode, guess, playerId };
      if (mode === 'endless' && sessionId) body.sessionId = sessionId;

      const res = await fetch(`${API}/api/evaluate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });

      if (res.status === 422) { dispatch({ type: 'SHAKE' }); return; }
      if (!res.ok) return;

      const data = await res.json();
      dispatch({
        type:         'GUESS_RESULT',
        guess,
        evaluation:   data.evaluation,
        won:          data.won,
        gameOver:     data.gameOver,
        hintMetadata: data.hintMetadata ?? null,
      });

      if (data.gameOver) {
        const url = mode === 'endless' && sessionId
          ? `${API}/api/reveal?mode=endless&sessionId=${sessionId}`
          : `${API}/api/reveal?mode=daily&playerId=${encodeURIComponent(playerId)}`;
        const rv = await fetch(url);
        if (rv.ok) {
          const { ticker } = await rv.json();
          dispatch({ type: 'SET_TARGET', target: ticker });
        }
      }
    } catch (err) {
      console.error('[submitGuess]', err);
    }
  }, [playerId]);

  // ── New endless game (async) ─────────────────────────────────────────────
  const newEndlessGame = useCallback(async () => {
    const s        = stateRef.current;
    const prevWon  = s.won;
    const prevStreak = s.streak;
    try {
      const res  = await fetch(`${API}/api/endless/next?sessionId=${s.sessionId ?? ''}`);
      const data = await res.json();
      dispatch({
        type:         'GAME_INIT',
        mode:         'endless',
        sessionId:    data.sessionId,
        targetLength: data.length,
        guesses:      [],
        evaluations:  [],
        gameOver:     false,
        won:          false,
        streak:       prevWon ? prevStreak + 1 : 0,
      });
    } catch (err) {
      console.error('[newEndlessGame]', err);
    }
  }, []);

  // ── Reveal letter hint (async — calls /api/hint/reveal-letter) ───────────
  const revealLetter = useCallback(async () => {
    const s = stateRef.current;
    if (s.revealedLetterPos !== null) return; // already revealed
    try {
      const body = { mode: s.mode, playerId };
      if (s.mode === 'endless' && s.sessionId) body.sessionId = s.sessionId;

      const res = await fetch(`${API}/api/hint/reveal-letter`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      if (!res.ok) return;
      const { pos, char } = await res.json();
      dispatch({ type: 'SET_REVEALED_LETTER', pos, char });
    } catch (err) {
      console.error('[revealLetter]', err);
    }
  }, [playerId]);

  // ── Synchronous callbacks ────────────────────────────────────────────────
  const addLetter    = useCallback((l)  => dispatch({ type: 'ADDLETTER',  letter: l.toUpperCase() }), []);
  const deleteLetter = useCallback(()   => dispatch({ type: 'DELETELETTER' }), []);
  const switchMode   = useCallback((m)  => dispatch({ type: 'SWITCHMODE', mode: m }), []);
  const resetGame    = useCallback(()   => dispatch({ type: 'RESETGAME' }), []);
  const makeHLGuess  = useCallback((g)  => dispatch({ type: 'MAKE_HL_GUESS', guess: g }), []);
  const useHint      = useCallback(()   => dispatch({ type: 'USE_HINT' }), []);

  const setPlayerName    = useCallback((v) => { localStorage.setItem('tickerdle_playerName',    v);      dispatch({ type: 'SET_PLAYER_NAME',   playerName:    v }); }, []);
  const setSoundEnabled  = useCallback((v) => { localStorage.setItem('tickerdle_soundEnabled',  v);      dispatch({ type: 'SET_SOUND_ENABLED', soundEnabled:  v }); }, []);
  const setSoundVolume   = useCallback((v) => { localStorage.setItem('tickerdle_soundVolume',   v);      dispatch({ type: 'SET_SOUND_VOLUME',  soundVolume:   v }); }, []);
  const setChartStyle    = useCallback((v) => { localStorage.setItem('tickerdle_chartStyle',    v);      dispatch({ type: 'SET_CHART_STYLE',   chartStyle:    v }); }, []);
  const setShowHowToPlay = useCallback((v) => { localStorage.setItem('tickerdle_showHTP',       v);      dispatch({ type: 'SET_SHOW_HTP',      showHowToPlay: v }); }, []);
  const setHintsEnabled  = useCallback((v) => { localStorage.setItem('tickerdle_hintsEnabled',  v);      dispatch({ type: 'SET_HINTS_ENABLED', hintsEnabled:  v }); }, []);
  const setScoreSubmitted = useCallback(()  => dispatch({ type: 'SET_SCORE_SUBMITTED' }), []);

  const value = {
    ...state,
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
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
