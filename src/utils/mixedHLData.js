/**
 * Mixed Higher/Lower pool — S&P 500 stocks + top cryptocurrencies.
 * Every item is tagged with { type: 'stock' | 'crypto' } so the UI can
 * display the right label.  Market caps are in billions USD for both pools,
 * so comparisons are fair.
 */

import { SP500_COMPANIES } from './sp500';
import { CRYPTO_COINS }    from './cryptoData';

const STOCK_POOL  = SP500_COMPANIES.map(c => ({ ...c, type: 'stock'  }));
const CRYPTO_POOL = CRYPTO_COINS.map(c =>    ({ ...c, type: 'crypto' }));
const MIXED_POOL  = [...STOCK_POOL, ...CRYPTO_POOL];

// ── Fisher-Yates shuffle ────────────────────────────────────────────────────
function fisherYates(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Session queue ───────────────────────────────────────────────────────────
let mixedQueue = [];

function refillMixedQueue(skipSymbol = null) {
  const pool = skipSymbol
    ? MIXED_POOL.filter(c => c.symbol !== skipSymbol)
    : [...MIXED_POOL];
  mixedQueue = fisherYates(pool);
}

function drawOneMixed(skipSymbol = null) {
  if (skipSymbol) {
    const idx = mixedQueue.findIndex(c => c.symbol === skipSymbol);
    if (idx !== -1) mixedQueue.splice(idx, 1);
  }
  if (mixedQueue.length === 0) refillMixedQueue(skipSymbol);
  return mixedQueue.shift();
}

/**
 * Returns { first, second } — two different items (stock or crypto).
 * Pass `excludeSymbol` to guarantee it doesn't appear in either slot.
 */
export function getRandomMixedPair(excludeSymbol = null) {
  const first  = drawOneMixed(excludeSymbol);
  const second = drawOneMixed(first.symbol);
  return { first, second };
}
