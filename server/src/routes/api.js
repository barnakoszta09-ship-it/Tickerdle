/**
 * All Tickerdle API routes.
 *
 * Security model
 * ──────────────
 * • The answer ticker is NEVER returned to the client during an active game.
 * • /api/daily returns only the ticker length + the date string.
 * • /api/evaluate performs guess validation and scoring server-side.
 * • /api/reveal only returns the answer once the game is complete
 *   (server tracks attempts per IP+date in memory).
 * • /api/chart/daily proxies Yahoo Finance using the server-side ticker
 *   so the client never sees which symbol is being fetched.
 * • The full ticker list never ships to the client; validation happens here.
 *
 * In-memory state
 * ───────────────
 * For a single-server VPS this is fine. Swap for Redis if you scale out.
 * Daily state resets naturally (keyed by date), endless sessions expire after 24 h.
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { appendFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const DATA_DIR   = join(__dirname, '../../../data');
const BUG_FILE   = join(DATA_DIR, 'bug-reports.ndjson');
import {
  TICKERS,
  getDailyTicker,
  getRandomTicker,
  isValidTicker,
  getDailySeed,
} from '../data/tickers.js';
import { evaluateGuess, MAX_ATTEMPTS } from '../utils/gameLogic.js';

const router = Router();

// ── In-memory game state ──────────────────────────────────────────────────────

/** Daily: "ip:YYYY-MM-DD" → { guesses: string[], evaluations: Array[], won, gameOver } */
const dailyState = new Map();

/** Endless: sessionId → { ticker, guesses, evaluations, won, gameOver, createdAt } */
const endlessSessions = new Map();

// Prune endless sessions older than 24 hours every 30 minutes.
setInterval(() => {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const [id, session] of endlessSessions) {
    if (session.createdAt < cutoff) endlessSessions.delete(id);
  }
}, 30 * 60 * 1000);

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayString() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function dailyKey(ip) {
  return `${ip}:${todayString()}`;
}

function getOrCreateDailyState(ip) {
  const key = dailyKey(ip);
  if (!dailyState.has(key)) {
    dailyState.set(key, { guesses: [], evaluations: [], won: false, gameOver: false });
  }
  return dailyState.get(key);
}

/** Fetch OHLC price history from Yahoo Finance (server-side — no CORS issue).
 *  Returns { prices: number[], ohlc: [{o,h,l,c}[]] }
 */
async function fetchPriceHistory(ticker) {
  const url =
    `https://query2.finance.yahoo.com/v8/finance/chart/` +
    `${encodeURIComponent(ticker)}?range=1y&interval=1d&events=none`;

  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`Yahoo Finance responded ${res.status}`);

  const json = await res.json();
  const q    = json?.chart?.result?.[0]?.indicators?.quote?.[0] ?? {};
  const rawO = q.open  ?? [];
  const rawH = q.high  ?? [];
  const rawL = q.low   ?? [];
  const rawC = q.close ?? [];

  const prices = [];
  const ohlc   = [];

  for (let i = 0; i < rawC.length; i++) {
    const o = rawO[i], h = rawH[i], l = rawL[i], c = rawC[i];
    if (c != null && Number.isFinite(c)) prices.push(c);
    if (
      o != null && h != null && l != null && c != null &&
      Number.isFinite(o) && Number.isFinite(h) &&
      Number.isFinite(l) && Number.isFinite(c)
    ) {
      ohlc.push({ o, h, l, c });
    }
  }

  return { prices, ohlc };
}

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /api/daily
 * Returns today's ticker LENGTH and date — never the ticker itself.
 */
router.get('/daily', (req, res) => {
  const ticker = getDailyTicker();
  const state  = getOrCreateDailyState(req.ip);

  res.json({
    date:        todayString(),
    length:      ticker.length,
    puzzleNum:   getDailySeed(),
    attempts:    state.guesses.length,
    gameOver:    state.gameOver,
    won:         state.won,
    // Re-send evaluations so the client can restore state after a page refresh.
    // Guesses are not included — client stored them in localStorage.
    evaluations: state.evaluations,
  });
});

/**
 * POST /api/evaluate
 * Body: { mode: "daily"|"endless", guess: "AAPL", sessionId?: "uuid" }
 * Returns the evaluation for this guess without revealing the answer.
 */
router.post('/evaluate', (req, res) => {
  const { mode = 'daily', guess, sessionId } = req.body ?? {};

  if (!guess || typeof guess !== 'string') {
    return res.status(400).json({ error: 'guess is required' });
  }

  const normalized = guess.toUpperCase().trim();

  // Validate the ticker exists
  if (!isValidTicker(normalized)) {
    return res.status(422).json({ error: 'invalid_ticker', valid: false });
  }

  if (mode === 'daily') {
    const ticker = getDailyTicker();
    const state  = getOrCreateDailyState(req.ip);

    if (state.gameOver) {
      return res.status(409).json({ error: 'game_over', gameOver: true, won: state.won });
    }

    const evaluation = evaluateGuess(normalized, ticker);
    const won        = normalized === ticker;

    state.guesses.push(normalized);
    state.evaluations.push(evaluation);
    state.won      = won;
    state.gameOver = won || state.guesses.length >= MAX_ATTEMPTS;

    return res.json({
      evaluation,
      won,
      gameOver:    state.gameOver,
      attemptsUsed: state.guesses.length,
      attemptsLeft: MAX_ATTEMPTS - state.guesses.length,
    });
  }

  if (mode === 'endless') {
    if (!sessionId) return res.status(400).json({ error: 'sessionId required for endless mode' });

    const session = endlessSessions.get(sessionId);
    if (!session) return res.status(404).json({ error: 'session_not_found' });
    if (session.gameOver) {
      return res.status(409).json({ error: 'game_over', gameOver: true, won: session.won });
    }

    const evaluation = evaluateGuess(normalized, session.ticker);
    const won        = normalized === session.ticker;

    session.guesses.push(normalized);
    session.evaluations.push(evaluation);
    session.won      = won;
    session.gameOver = won || session.guesses.length >= MAX_ATTEMPTS;

    return res.json({
      evaluation,
      won,
      gameOver:    session.gameOver,
      attemptsUsed: session.guesses.length,
      attemptsLeft: MAX_ATTEMPTS - session.guesses.length,
    });
  }

  res.status(400).json({ error: 'mode must be "daily" or "endless"' });
});

/**
 * GET /api/reveal?mode=daily  OR  GET /api/reveal?mode=endless&sessionId=uuid
 * Returns the answer ONLY after the game is complete.
 */
router.get('/reveal', (req, res) => {
  const { mode = 'daily', sessionId } = req.query;

  if (mode === 'daily') {
    const state = getOrCreateDailyState(req.ip);
    if (!state.gameOver) {
      return res.status(403).json({ error: 'game_not_over' });
    }
    return res.json({ ticker: getDailyTicker() });
  }

  if (mode === 'endless') {
    const session = endlessSessions.get(sessionId);
    if (!session) return res.status(404).json({ error: 'session_not_found' });
    if (!session.gameOver) return res.status(403).json({ error: 'game_not_over' });
    return res.json({ ticker: session.ticker });
  }

  res.status(400).json({ error: 'invalid mode' });
});

/**
 * POST /api/validate
 * Body: { ticker: "AAPL" }
 * Returns whether the ticker is in the allowed list — without leaking the list itself.
 */
router.post('/validate', (req, res) => {
  const { ticker } = req.body ?? {};
  if (!ticker || typeof ticker !== 'string') {
    return res.status(400).json({ error: 'ticker is required' });
  }
  res.json({ valid: isValidTicker(ticker) });
});

/**
 * GET /api/endless/new
 * Starts a new endless session. Returns a sessionId and the ticker length.
 */
router.get('/endless/new', (req, res) => {
  const sessionId = uuidv4();
  const ticker    = getRandomTicker();

  endlessSessions.set(sessionId, {
    ticker,
    guesses:     [],
    evaluations: [],
    won:         false,
    gameOver:    false,
    createdAt:   Date.now(),
  });

  res.json({ sessionId, length: ticker.length });
});

/**
 * GET /api/endless/next?sessionId=uuid
 * After a completed endless game, start the next round (new ticker, same session continuity).
 * The old session is discarded; a new sessionId is issued.
 */
router.get('/endless/next', (req, res) => {
  const { sessionId } = req.query;
  const old = endlessSessions.get(sessionId);

  const exclude   = old ? [old.ticker] : [];
  const newId     = uuidv4();
  const ticker    = getRandomTicker(exclude);

  endlessSessions.set(newId, {
    ticker,
    guesses:     [],
    evaluations: [],
    won:         false,
    gameOver:    false,
    createdAt:   Date.now(),
  });

  if (sessionId) endlessSessions.delete(sessionId);

  res.json({ sessionId: newId, length: ticker.length });
});

/**
 * GET /api/chart/daily
 * Proxies the Yahoo Finance 1-year daily chart for today's ticker.
 * The client never sees which ticker is being requested.
 */
router.get('/chart/daily', async (req, res) => {
  try {
    const { prices, ohlc } = await fetchPriceHistory(getDailyTicker());
    res.json({ prices, ohlc });
  } catch (err) {
    res.status(502).json({ error: 'chart_unavailable', prices: [], ohlc: [] });
  }
});

/**
 * GET /api/chart/endless?sessionId=uuid
 * Same as /chart/daily but for the endless session's ticker.
 */
router.get('/chart/endless', async (req, res) => {
  const session = endlessSessions.get(req.query.sessionId);
  if (!session) return res.status(404).json({ error: 'session_not_found', prices: [], ohlc: [] });

  try {
    const { prices, ohlc } = await fetchPriceHistory(session.ticker);
    res.json({ prices, ohlc });
  } catch (err) {
    res.status(502).json({ error: 'chart_unavailable', prices: [], ohlc: [] });
  }
});

/**
 * POST /api/bug-report
 * Body: { description, mode, userAgent }
 * Appends report to a newline-delimited JSON file in server/data/.
 */
router.post('/bug-report', (req, res) => {
  const { description, mode, userAgent } = req.body ?? {};

  if (!description || typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({ error: 'description is required' });
  }

  const report = {
    timestamp:   new Date().toISOString(),
    description: description.slice(0, 2000).trim(),
    mode:        (mode        || 'unknown').slice(0, 50),
    userAgent:   (userAgent   || '').slice(0, 500),
    ip:          req.ip,
  };

  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    appendFileSync(BUG_FILE, JSON.stringify(report) + '\n', 'utf8');
    res.json({ success: true });
  } catch (err) {
    console.error('[bug-report] Failed to save:', err);
    res.status(500).json({ error: 'Failed to save report' });
  }
});

/**
 * GET /api/chart/ticker?ticker=AAPL
 * Returns 1-year OHLC data for any valid S&P 500 ticker.
 * Used by the frontend BackgroundChart in endless mode (ticker is known
 * client-side since game logic hasn't been migrated to server yet).
 * The endpoint validates the ticker against the allowed list so it cannot
 * be abused to probe arbitrary Yahoo Finance symbols.
 */
router.get('/chart/ticker', async (req, res) => {
  const raw = req.query.ticker;
  if (!raw || typeof raw !== 'string') {
    return res.status(400).json({ error: 'ticker param required', prices: [], ohlc: [] });
  }
  const ticker = raw.toUpperCase().trim();
  if (!isValidTicker(ticker)) {
    return res.status(400).json({ error: 'invalid_ticker', prices: [], ohlc: [] });
  }
  try {
    const data = await fetchPriceHistory(ticker);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'chart_unavailable', prices: [], ohlc: [] });
  }
});

/**
 * GET /health
 * Simple liveness check for load balancers / uptime monitors.
 */
router.get('/health', (req, res) => {
  res.json({
    status:  'ok',
    uptime:  Math.floor(process.uptime()),
    date:    todayString(),
    ticker:  getDailyTicker().length + ' letters', // length only — no ticker
  });
});

export default router;
