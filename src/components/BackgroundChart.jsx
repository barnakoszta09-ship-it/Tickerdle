/**
 * BackgroundChart — faint stock price chart rendered behind the game board.
 *
 * Supports two display modes (chartStyle from GameContext):
 *   "line"   — Catmull-Rom smooth price line + area fill (default)
 *   "candle" — Weekly OHLC candlesticks; green = up day, red = down day
 *
 * Positioning: absolute, fills section above the keyboard (--keyboard-height).
 * Opacity:     very low so tiles always read clearly.
 * Privacy:     ticker name is never rendered, only the chart shape.
 */
import { useEffect, useState, useRef } from 'react';
import { useGame } from '../context';

// Same base URL used by BugReportModal — empty string = same origin in prod.
// Set VITE_API_URL=http://localhost:3001 in .env.local for local dev.
const API_BASE = import.meta.env.VITE_API_URL ?? '';

// Module-level cache — avoids re-fetching when component remounts
const priceCache = {};

// ── Smooth line helpers ────────────────────────────────────────────────────────

function buildSmoothPath(pts) {
  if (pts.length < 2) return '';
  const d = [`M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`];
  const t = 0.25;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1[0] + (p2[0] - p0[0]) * t;
    const cp1y = p1[1] + (p2[1] - p0[1]) * t;
    const cp2x = p2[0] - (p3[0] - p1[0]) * t;
    const cp2y = p2[1] - (p3[1] - p1[1]) * t;
    d.push(
      `C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ` +
      `${cp2x.toFixed(2)},${cp2y.toFixed(2)} ` +
      `${p2[0].toFixed(2)},${p2[1].toFixed(2)}`
    );
  }
  return d.join(' ');
}

// ── Candlestick helpers ────────────────────────────────────────────────────────

/** Aggregate daily OHLC into weekly bars (every 5 trading days). */
function aggregateWeekly(ohlc) {
  const weekly = [];
  for (let i = 0; i < ohlc.length; i += 5) {
    const week = ohlc.slice(i, i + 5);
    if (week.length === 0) continue;
    weekly.push({
      o: week[0].o,
      h: Math.max(...week.map(d => d.h)),
      l: Math.min(...week.map(d => d.l)),
      c: week[week.length - 1].c,
    });
  }
  return weekly;
}

const UP_COLOR = '#4ade80'; // green — matches line chart colour
const DN_COLOR = '#f87171'; // muted red — pairs well with dark terminal bg

function CandlestickLayer({ ohlc, W, H, padX, padY }) {
  const weekly = aggregateWeekly(ohlc);
  if (weekly.length < 2) return null;

  const n      = weekly.length;
  const slotW  = (W - 2 * padX) / n;
  const bodyW  = slotW * 0.52;           // 52 % of slot = small gap between candles

  const allPx  = weekly.flatMap(d => [d.o, d.h, d.l, d.c]);
  const min    = Math.min(...allPx);
  const max    = Math.max(...allPx);
  const range  = max - min || 1;

  const toY = (p) => H - padY - ((p - min) / range) * (H - 2 * padY);
  const toX = (i) => padX + (i + 0.5) * slotW;

  // Mid reference line
  const midY = toY((min + max) / 2).toFixed(2);

  return (
    <>
      {/* Dashed mid-price reference */}
      <line
        x1={padX} y1={midY} x2={W - padX} y2={midY}
        stroke={UP_COLOR}
        strokeWidth="1"
        strokeDasharray="4 12"
        strokeLinecap="round"
        opacity="0.5"
        vectorEffect="non-scaling-stroke"
      />

      {weekly.map((candle, i) => {
        const x     = toX(i);
        const isUp  = candle.c >= candle.o;
        const color = isUp ? UP_COLOR : DN_COLOR;

        const bodyTop = toY(Math.max(candle.o, candle.c));
        const bodyBot = toY(Math.min(candle.o, candle.c));
        const bodyH   = Math.max(bodyBot - bodyTop, 1.5); // min 1.5 for doji

        const wickTop = toY(candle.h);
        const wickBot = toY(candle.l);

        return (
          <g key={i}>
            {/* Soft glow halo around body */}
            <rect
              x={x - bodyW * 1.4}
              y={bodyTop - 2}
              width={bodyW * 2.8}
              height={bodyH + 4}
              fill={color}
              opacity="0.10"
            />
            {/* High-low wick */}
            <line
              x1={x} y1={wickTop}
              x2={x} y2={wickBot}
              stroke={color}
              strokeWidth="1"
              strokeOpacity="0.70"
              vectorEffect="non-scaling-stroke"
            />
            {/* Candle body */}
            <rect
              x={x - bodyW / 2}
              y={bodyTop}
              width={bodyW}
              height={bodyH}
              fill={color}
            />
          </g>
        );
      })}
    </>
  );
}

// ── CSS mask ──────────────────────────────────────────────────────────────────
const MASK_H = 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)';
const maskStyle = { WebkitMaskImage: MASK_H, maskImage: MASK_H };

// ── Main component ────────────────────────────────────────────────────────────

export default function BackgroundChart() {
  const { mode, sessionId, chartStyle = 'line' } = useGame();
  const [prices, setPrices] = useState(null);
  const [ohlc,   setOhlc]   = useState(null);
  const abortRef = useRef(null);

  const isGameMode = mode === 'daily' || mode === 'endless';
  // Cache key: 'daily' for daily mode, sessionId for endless
  const cacheKey = mode === 'daily' ? 'daily' : (sessionId ?? null);

  useEffect(() => {
    if (!isGameMode || !cacheKey) { setPrices(null); setOhlc(null); return; }

    if (priceCache[cacheKey]) {
      setPrices(priceCache[cacheKey].prices);
      setOhlc(priceCache[cacheKey].ohlc);
      return;
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    (async () => {
      try {
        // Both modes hit our own backend — ticker is never exposed to client
        const url = mode === 'daily'
          ? `${API_BASE}/api/chart/daily`
          : `${API_BASE}/api/chart/endless?sessionId=${encodeURIComponent(sessionId)}`;

        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) return;

        const { prices: fetchedPrices, ohlc: fetchedOhlc } = await res.json();
        if (!fetchedPrices || fetchedPrices.length < 10) return;

        priceCache[cacheKey] = { prices: fetchedPrices, ohlc: fetchedOhlc ?? [] };
        if (!ac.signal.aborted) {
          setPrices(fetchedPrices);
          setOhlc(fetchedOhlc ?? []);
        }
      } catch (err) {
        if (err.name !== 'AbortError') { /* decorative — fail silently */ }
      }
    })();

    return () => ac.abort();
  }, [cacheKey, isGameMode]);

  if (!isGameMode) return null;
  if (chartStyle === 'candle' && (!ohlc || ohlc.length < 10)) return null;
  if (chartStyle === 'line'   && (!prices || prices.length < 2)) return null;

  // ── SVG geometry (line mode) ─────────────────────────────────────────────────
  const W    = 1000;
  const H    = 400;
  const padX = 20;
  const padY = 30;

  // ── Line chart paths ─────────────────────────────────────────────────────────
  let linePath = '', areaPath = '', midY = '200';

  if (chartStyle === 'line' && prices) {
    const min   = Math.min(...prices);
    const max   = Math.max(...prices);
    const range = max - min || 1;

    const toX = (i) => padX + (i / (prices.length - 1)) * (W - 2 * padX);
    const toY = (p) => H - padY - ((p - min) / range) * (H - 2 * padY);

    const coords = prices.map((p, i) => [toX(i), toY(p)]);
    linePath = buildSmoothPath(coords);

    const x0     = toX(0).toFixed(2);
    const xN     = toX(prices.length - 1).toFixed(2);
    const yFloor = (H - padY + 6).toFixed(2);
    areaPath = `${linePath} L${xN},${yFloor} L${x0},${yFloor} Z`;
    midY     = toY((min + max) / 2).toFixed(2);
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div
      aria-hidden="true"
      className="opacity-[0.12] sm:opacity-[0.19]"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 'var(--keyboard-height, 176px)',
        zIndex: -1,
        pointerEvents: 'none',
        ...maskStyle,
      }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        focusable="false"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        {chartStyle === 'line' ? (
          <>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#4ade80" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#4ade80" stopOpacity="0"    />
              </linearGradient>
            </defs>

            {/* Area fill */}
            <path d={areaPath} fill="url(#areaGrad)" />

            {/* Mid-price reference */}
            <line
              x1={padX} y1={midY} x2={W - padX} y2={midY}
              stroke="#4ade80"
              strokeWidth="1"
              strokeDasharray="4 12"
              strokeLinecap="round"
              opacity="0.5"
              vectorEffect="non-scaling-stroke"
            />

            {/* Wide bloom */}
            <path d={linePath} fill="none" stroke="#4ade80" strokeWidth="10"
              strokeOpacity="0.06" strokeLinejoin="round" strokeLinecap="round"
              vectorEffect="non-scaling-stroke" />

            {/* Mid haze */}
            <path d={linePath} fill="none" stroke="#4ade80" strokeWidth="4"
              strokeOpacity="0.14" strokeLinejoin="round" strokeLinecap="round"
              vectorEffect="non-scaling-stroke" />

            {/* Crisp line */}
            <path d={linePath} fill="none" stroke="#4ade80" strokeWidth="1.8"
              strokeLinejoin="round" strokeLinecap="round"
              vectorEffect="non-scaling-stroke" />
          </>
        ) : (
          /* Candle mode */
          ohlc && (
            <CandlestickLayer
              ohlc={ohlc} W={W} H={H} padX={padX} padY={padY}
            />
          )
        )}
      </svg>
    </div>
  );
}
