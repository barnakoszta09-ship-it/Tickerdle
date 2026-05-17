import 'dotenv/config';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import apiRouter from './routes/api.js';
import leaderboardRouter from './routes/leaderboard.js';

const PORT        = process.env.PORT        || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://tickerdle.org';
const NODE_ENV    = process.env.NODE_ENV    || 'development';

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── Trust proxy (nginx sits in front) ────────────────────────────────────────
app.set('trust proxy', 1);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins =
  NODE_ENV === 'production'
    ? [CORS_ORIGIN, `https://www.${CORS_ORIGIN.replace('https://', '')}`]
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '16kb' }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max:      60,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many requests — please slow down.' },
});
app.use('/api', limiter);

const evaluateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      20,
  message:  { error: 'Too many guesses — slow down.' },
});
app.use('/api/evaluate', evaluateLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', apiRouter);
app.use('/api/leaderboard', leaderboardRouter);

// ── 404 / error handlers ──────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── HTTP server (shared with WebSocket) ───────────────────────────────────────
const httpServer = createServer(app);

// ── WebSocket — live player counter ───────────────────────────────────────────
//
// Each connected tab is tracked in `clients` as:
//   ws → { lastSeen: timestamp }
//
// Lifecycle:
//   connect  → add to map, broadcast new count to everyone
//   message  → any message (heartbeat ping) resets lastSeen
//   close    → remove from map, broadcast new count
//   idle     → clients silent for > 5 min are terminated by the prune interval

const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

/** ws socket → { lastSeen: number } */
const clients = new Map();

function liveCount() {
  return clients.size;
}

function broadcast() {
  const msg = JSON.stringify({ count: liveCount() });
  for (const [ws] of clients) {
    if (ws.readyState === ws.OPEN) ws.send(msg);
  }
}

wss.on('connection', (ws) => {
  clients.set(ws, { lastSeen: Date.now() });
  broadcast();

  // Any inbound message (heartbeat ping from client) refreshes lastSeen
  ws.on('message', () => {
    const meta = clients.get(ws);
    if (meta) meta.lastSeen = Date.now();
  });

  ws.on('close', () => {
    clients.delete(ws);
    broadcast();
  });

  // Remove socket from map on error so it doesn't linger
  ws.on('error', () => clients.delete(ws));
});

// Prune clients idle for > 5 minutes — catches abandoned tabs that never
// sent a close frame (mobile browsers backgrounded, laptop lids closed, etc.)
const IDLE_MS = 5 * 60 * 1000;
setInterval(() => {
  const cutoff = Date.now() - IDLE_MS;
  let changed  = false;
  for (const [ws, meta] of clients) {
    if (meta.lastSeen < cutoff) {
      ws.terminate();
      clients.delete(ws);
      changed = true;
    }
  }
  if (changed) broadcast();
}, 60_000);

// ── Start ─────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`[tickerdle-server] listening on port ${PORT} (${NODE_ENV})`);
});
