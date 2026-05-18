/**
 * S&P 500 constituent ticker list — client copy used for local validation.
 * Source: Wikipedia "List of S&P 500 companies" (scraped May 2025).
 * Must stay in sync with server/src/data/tickers.js.
 * Excludes dot-class shares (BRK.B, BF.B) — no dot key on the game keyboard.
 */

// ── Communication Services ────────────────────────────────────────────────────
const COMM = [
  'CHTR', 'CMCSA', 'EA', 'FOXA', 'FOX', 'GOOG', 'GOOGL', 'LYV',
  'META', 'NFLX', 'NWSA', 'NWS', 'OMC', 'PSKY', 'SATS', 'T', 'TMUS', 'VZ', 'WBD',
];

// ── Consumer Discretionary ────────────────────────────────────────────────────
const DISC = [
  'ABNB', 'AMZN', 'APTV', 'AZO', 'BBY', 'BKNG', 'CCL', 'CVNA', 'DASH',
  'DECK', 'DHI', 'DPZ', 'DRI', 'EBAY', 'EXPE', 'F', 'GM', 'GPC', 'GRMN',
  'HAS', 'HD', 'HLT', 'LEN', 'LOW', 'LULU', 'LVS', 'MAR', 'MCD', 'MGM',
  'NKE', 'NCLH', 'NVR', 'ORLY', 'POOL', 'RCL', 'RL', 'ROST', 'TJX', 'TKO',
  'TPR', 'TSLA', 'TTWO', 'YUM',
];

// ── Consumer Staples ──────────────────────────────────────────────────────────
const STAP = [
  'ADM', 'BG', 'CAG', 'CASY', 'CL', 'CLX', 'COST', 'CPB', 'DG', 'DLTR',
  'EL', 'GIS', 'HRL', 'HSY', 'KDP', 'KHC', 'KMB', 'KO', 'KR', 'KVUE',
  'MDLZ', 'MKC', 'MNST', 'MO', 'PEP', 'PG', 'PM', 'STZ', 'SYY', 'TAP',
  'TSN', 'WMT',
];

// ── Energy ────────────────────────────────────────────────────────────────────
const ENRG = [
  'APA', 'BKR', 'COP', 'CVX', 'DVN', 'EOG', 'EQT', 'EXE', 'FANG', 'HAL',
  'KMI', 'MPC', 'OKE', 'OXY', 'PSX', 'SLB', 'TPL', 'TRGP', 'VLO', 'XOM',
];

// ── Financials ────────────────────────────────────────────────────────────────
const FINL = [
  'ACGL', 'AFL', 'AIG', 'AIZ', 'AJG', 'ALL', 'AMP', 'APO', 'ARES', 'AXP',
  'BAC', 'BEN', 'BK', 'BLK', 'BRO', 'BX', 'C', 'CB', 'CBOE', 'CFG', 'CINF',
  'CME', 'COIN', 'COF', 'CPAY', 'EG', 'ERIE', 'FDS', 'FIS', 'FISV', 'FITB',
  'GL', 'GPN', 'GS', 'HIG', 'HBAN', 'IBKR', 'ICE', 'IVZ', 'JKHY', 'JPM',
  'KEY', 'KKR', 'L', 'MCO', 'MET', 'MMC', 'MS', 'MSCI', 'MTB', 'NDAQ',
  'NTRS', 'PFG', 'PNC', 'PRU', 'PYPL', 'RF', 'RJF', 'SCHW', 'SPGI', 'STT',
  'SYF', 'TFC', 'TROW', 'TRV', 'USB', 'V', 'WFC', 'WRB', 'WTW', 'XYZ',
];

// ── Health Care ───────────────────────────────────────────────────────────────
const HLTH = [
  'A', 'ABT', 'ABBV', 'ALGN', 'AMGN', 'BAX', 'BDX', 'BIIB', 'BMY', 'BSX',
  'CAH', 'CI', 'CNC', 'COO', 'COR', 'CRL', 'CVS', 'DHR', 'DGX', 'DVA',
  'DXCM', 'ELV', 'EW', 'GEHC', 'GILD', 'HCA', 'HSIC', 'HUM', 'IDXX', 'INCY',
  'IQV', 'ISRG', 'JNJ', 'LH', 'LLY', 'MCK', 'MDT', 'MRK', 'MRNA', 'MTD',
  'PFE', 'PODD', 'REGN', 'RMD', 'RVTY', 'SOLV', 'STE', 'SYK', 'TECH', 'TMO',
  'UHS', 'VRTX', 'VTRS', 'ZBH', 'ZTS',
];

// ── Industrials ───────────────────────────────────────────────────────────────
const INDU = [
  'ADP', 'ALLE', 'AME', 'AOS', 'AXON', 'BA', 'BLDR', 'BR', 'CARR', 'CAT',
  'CHRW', 'CMI', 'CPRT', 'CSX', 'DAL', 'DE', 'DOV', 'EFX', 'EME', 'EMR',
  'EXPD', 'FAST', 'FDX', 'FIX', 'FTV', 'GD', 'GE', 'GEV', 'GNRC', 'GWW',
  'HII', 'HON', 'HUBB', 'HWM', 'IEX', 'IR', 'ITW', 'J', 'JBHT', 'JCI',
  'LDOS', 'LHX', 'LII', 'LMT', 'MAS', 'MMM', 'NDSN', 'NOC', 'NSC', 'ODFL',
  'OTIS', 'PCAR', 'PAYX', 'PH', 'PNR', 'PWR', 'ROK', 'ROL', 'ROP', 'RTX',
  'SNA', 'SW', 'SWK', 'TDG', 'TDY', 'TEL', 'TT', 'TXT', 'UAL', 'UNP',
  'UPS', 'URI', 'VLTO', 'WAB',
];

// ── Information Technology ────────────────────────────────────────────────────
const TECH = [
  'AAPL', 'ACN', 'ADBE', 'ADI', 'ADSK', 'AKAM', 'AMD', 'AMAT', 'ANET', 'APP',
  'APH', 'AVGO', 'CDNS', 'CIEN', 'COHR', 'CRM', 'CRWD', 'CSCO', 'CTSH',
  'DDOG', 'DELL', 'FFIV', 'FICO', 'FSLR', 'FTNT', 'GEN', 'GDDY', 'GLW',
  'HPE', 'HPQ', 'IBM', 'INTC', 'INTU', 'IT', 'JBL', 'KEYS', 'KLAC', 'LITE',
  'LRCX', 'MCHP', 'MPWR', 'MSI', 'MU', 'MSFT', 'NTAP', 'NVDA', 'NXPI', 'ON',
  'ORCL', 'PANW', 'PLTR', 'QCOM', 'SMCI', 'SNDK', 'SNPS', 'SWKS', 'TER',
  'TRMB', 'TXN', 'TYL', 'VRSN', 'WDC',
];

// ── Materials ─────────────────────────────────────────────────────────────────
const MATL = [
  'ALB', 'AMCR', 'APD', 'AVY', 'BALL', 'CF', 'CRH', 'CTVA', 'DD', 'DOW',
  'ECL', 'FCX', 'IFF', 'IP', 'LIN', 'LYB', 'MLM', 'MOS', 'NEM', 'NUE',
  'PKG', 'PPG', 'STLD', 'VMC',
];

// ── Real Estate ───────────────────────────────────────────────────────────────
const RLST = [
  'AMT', 'ARE', 'AVB', 'BXP', 'CCI', 'CBRE', 'CSGP', 'CPT', 'DLR', 'DOC',
  'EQIX', 'EQR', 'ESS', 'EXR', 'FRT', 'HST', 'INVH', 'IRM', 'KIM', 'MAA',
  'O', 'PLD', 'PSA', 'REG', 'SBAC', 'UDR', 'VICI', 'VTR', 'WELL', 'WY',
];

// ── Utilities ─────────────────────────────────────────────────────────────────
const UTIL = [
  'AEE', 'AEP', 'AES', 'ATO', 'AWK', 'CEG', 'CMS', 'CNP', 'D', 'DTE',
  'DUK', 'ED', 'EIX', 'ES', 'ETR', 'EVRG', 'EXC', 'FE', 'LNT', 'NEE',
  'NI', 'NRG', 'PCG', 'PEG', 'PNW', 'PPL', 'SRE', 'SO', 'VST', 'WEC', 'XEL',
];

// ── Master list ───────────────────────────────────────────────────────────────
export const TICKERS = [
  ...COMM, ...DISC, ...STAP, ...ENRG, ...FINL,
  ...HLTH, ...INDU, ...TECH, ...MATL, ...RLST, ...UTIL,
];

// ── Sector lookup map (symbol → sector name) ──────────────────────────────────
const _SECTOR_DEFS = [
  ['Communication Services', COMM],
  ['Consumer Discretionary', DISC],
  ['Consumer Staples',       STAP],
  ['Energy',                 ENRG],
  ['Financials',             FINL],
  ['Health Care',            HLTH],
  ['Industrials',            INDU],
  ['Information Technology', TECH],
  ['Materials',              MATL],
  ['Real Estate',            RLST],
  ['Utilities',              UTIL],
];
export const TICKER_SECTORS = {};
_SECTOR_DEFS.forEach(([name, arr]) => arr.forEach(t => { TICKER_SECTORS[t] = name; }));

// ── Helper functions (keep in sync with server) ───────────────────────────────

export function getDailySeed() {
  const now   = new Date();
  const start = new Date(2024, 0, 1);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

export function getDailyTicker() {
  return TICKERS[getDailySeed() % TICKERS.length];
}

export function getRandomTicker(exclude = []) {
  const available = TICKERS.filter(t => !exclude.includes(t));
  return available[Math.floor(Math.random() * available.length)];
}

export function isValidTicker(ticker) {
  return TICKERS.includes(ticker.toUpperCase());
}
