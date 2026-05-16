import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import apiRouter from './routes/api.js';

const PORT        = process.env.PORT        || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://tickerdle.org';
const NODE_ENV    = process.env.NODE_ENV    || 'development';

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── Trust proxy (nginx sits in front) ────────────────────────────────────────
// This lets req.ip return the real client IP from X-Forwarded-For.
app.set('trust proxy', 1);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins =
  NODE_ENV === 'production'
    ? [CORS_ORIGIN, `https://www.${CORS_ORIGIN.replace('https://', '')}`]
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no Origin header (curl, Postman, same-origin)
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
  windowMs: 60 * 1000,   // 1 minute window
  max:      60,           // 60 requests per IP per minute
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many requests — please slow down.' },
});
app.use('/api', limiter);

// A stricter limiter for the evaluate endpoint to prevent brute-forcing the answer
const evaluateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      20,           // max 20 guesses per minute per IP
  message:  { error: 'Too many guesses — slow down.' },
});
app.use('/api/evaluate', evaluateLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', apiRouter);

// ── 404 catch-all ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[tickerdle-server] listening on port ${PORT} (${NODE_ENV})`);
});
