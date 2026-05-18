/**
 * Hint metadata for every ticker — sector and market-cap tier.
 * Sector data is derived from the tickers.js arrays (single source of truth).
 * Market cap data is derived from sp500.js (already used by H/L mode).
 */
import { TICKER_SECTORS } from './tickers';
import { SP500_COMPANIES } from './sp500';

// Build a fast symbol → marketCap (billions) lookup
const _CAP_MAP = {};
SP500_COMPANIES.forEach(c => { _CAP_MAP[c.symbol] = c.marketCap; });

function getMarketCapTier(capB) {
  if (capB >= 500) return 'Mega Cap (>$500B)';
  if (capB >= 100) return 'Large Cap ($100B–$500B)';
  if (capB >= 10)  return 'Mid Cap ($10B–$100B)';
  return 'Small Cap (<$10B)';
}

/**
 * Returns { sector, marketCapTier } for a given ticker symbol.
 * Safe to call with any symbol — returns 'Unknown' for missing data.
 */
export function getTickerHints(symbol) {
  const sector       = TICKER_SECTORS[symbol] || 'Unknown';
  const capB         = _CAP_MAP[symbol];
  const marketCapTier = capB != null ? getMarketCapTier(capB) : 'Unknown';
  return { sector, marketCapTier };
}
