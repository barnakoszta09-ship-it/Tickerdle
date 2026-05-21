import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname       = dirname(fileURLToPath(import.meta.url));
const DATA_DIR        = join(__dirname, '../../../data');
const LEADERBOARD_FILE = join(DATA_DIR, 'leaderboard.json');

const VALID_MODES = new Set(['daily', 'endless', 'higher-lower', 'crypto', 'mixed-hl']);

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function load() {
  try {
    if (existsSync(LEADERBOARD_FILE)) {
      return JSON.parse(readFileSync(LEADERBOARD_FILE, 'utf8'));
    }
  } catch {}
  return { daily: [], endless: [], 'higher-lower': [] };
}

function persist(data) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(LEADERBOARD_FILE, JSON.stringify(data, null, 2), 'utf8');
}

const router = Router();

/**
 * POST /api/leaderboard
 * Body: { mode, playerId, playerName, score }
 * Upserts one entry per player (per day for daily mode).
 * Keeps the highest score — never downgrades.
 */
router.post('/', (req, res) => {
  const { mode, playerId, playerName, score } = req.body ?? {};

  if (!VALID_MODES.has(mode))
    return res.status(400).json({ error: 'invalid mode' });
  if (!playerId || typeof playerId !== 'string' || playerId.length > 64)
    return res.status(400).json({ error: 'playerId required' });
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0)
    return res.status(400).json({ error: 'invalid score' });

  const name = (typeof playerName === 'string' && playerName.trim())
    ? playerName.trim().slice(0, 32)
    : 'Anonymous';
  const date = todayString();

  const data = load();
  if (!data[mode]) data[mode] = [];
  const list = data[mode];

  // Dedup key: daily → one entry per player per calendar day
  //            endless / higher-lower → one entry per player all-time
  const existingIdx = mode === 'daily'
    ? list.findIndex(e => e.playerId === playerId && e.date === date)
    : list.findIndex(e => e.playerId === playerId);

  if (existingIdx >= 0) {
    if (score > list[existingIdx].score) {
      list[existingIdx] = { ...list[existingIdx], playerName: name, score, updatedAt: new Date().toISOString() };
    }
    // If new score isn't higher, still update the name in case they changed it
    else {
      list[existingIdx].playerName = name;
    }
  } else {
    list.push({ playerId, playerName: name, score, date, submittedAt: new Date().toISOString() });
  }

  data[mode] = list.sort((a, b) => b.score - a.score).slice(0, 100);
  persist(data);

  res.json({ success: true });
});

/**
 * GET /api/leaderboard/:mode
 * Returns top 10 for the given mode, sorted by score descending.
 */
router.get('/:mode', (req, res) => {
  const { mode } = req.params;
  if (!VALID_MODES.has(mode))
    return res.status(400).json({ error: 'invalid mode' });

  const data = load();
  const entries = (data[mode] ?? []).slice(0, 10).map((e, i) => ({
    rank:       i + 1,
    playerName: e.playerName,
    score:      e.score,
    date:       e.date,
  }));

  res.json(entries);
});

export default router;
