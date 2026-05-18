/**
 * Top cryptocurrencies with approximate market caps (billions USD, May 2026).
 * Stablecoins excluded — comparing USDT vs BTC is not fun gameplay.
 * Market caps are rounded to the nearest billion for clean display.
 */

export const CRYPTO_COINS = [
  { symbol: 'BTC',   name: 'Bitcoin',            marketCap: 1900 },
  { symbol: 'ETH',   name: 'Ethereum',            marketCap:  290 },
  { symbol: 'XRP',   name: 'XRP',                 marketCap:  135 },
  { symbol: 'BNB',   name: 'BNB',                 marketCap:   95 },
  { symbol: 'SOL',   name: 'Solana',              marketCap:   85 },
  { symbol: 'TON',   name: 'Toncoin',             marketCap:   35 },
  { symbol: 'DOGE',  name: 'Dogecoin',            marketCap:   28 },
  { symbol: 'ADA',   name: 'Cardano',             marketCap:   22 },
  { symbol: 'TRX',   name: 'TRON',                marketCap:   22 },
  { symbol: 'AVAX',  name: 'Avalanche',           marketCap:   14 },
  { symbol: 'SUI',   name: 'Sui',                 marketCap:   12 },
  { symbol: 'SHIB',  name: 'Shiba Inu',           marketCap:   11 },
  { symbol: 'LINK',  name: 'Chainlink',           marketCap:   10 },
  { symbol: 'DOT',   name: 'Polkadot',            marketCap:    9 },
  { symbol: 'BCH',   name: 'Bitcoin Cash',        marketCap:    9 },
  { symbol: 'LTC',   name: 'Litecoin',            marketCap:    8 },
  { symbol: 'UNI',   name: 'Uniswap',             marketCap:    7 },
  { symbol: 'KAS',   name: 'Kaspa',               marketCap:    6 },
  { symbol: 'XLM',   name: 'Stellar',             marketCap:    5 },
  { symbol: 'NEAR',  name: 'NEAR Protocol',       marketCap:    5 },
  { symbol: 'APT',   name: 'Aptos',               marketCap:    5 },
  { symbol: 'ICP',   name: 'Internet Computer',   marketCap:    5 },
  { symbol: 'ETC',   name: 'Ethereum Classic',    marketCap:    4 },
  { symbol: 'HBAR',  name: 'Hedera',              marketCap:    4 },
  { symbol: 'CRO',   name: 'Cronos',              marketCap:    3 },
  { symbol: 'ARB',   name: 'Arbitrum',            marketCap:    3 },
  { symbol: 'AAVE',  name: 'Aave',                marketCap:    3 },
  { symbol: 'FIL',   name: 'Filecoin',            marketCap:    3 },
  { symbol: 'ALGO',  name: 'Algorand',            marketCap:    3 },
  { symbol: 'ATOM',  name: 'Cosmos',              marketCap:    2 },
  { symbol: 'VET',   name: 'VeChain',             marketCap:    2 },
  { symbol: 'MNT',   name: 'Mantle',              marketCap:    2 },
  { symbol: 'STX',   name: 'Stacks',              marketCap:    2 },
  { symbol: 'OP',    name: 'Optimism',            marketCap:    2 },
  { symbol: 'MKR',   name: 'Maker',               marketCap:    2 },
  { symbol: 'FTM',   name: 'Sonic (Fantom)',      marketCap:    2 },
  { symbol: 'THETA', name: 'Theta Network',       marketCap:    2 },
  { symbol: 'IMX',   name: 'Immutable',           marketCap:    1 },
  { symbol: 'WLD',   name: 'Worldcoin',           marketCap:    1 },
  { symbol: 'EGLD',  name: 'MultiversX',          marketCap:    1 },
  { symbol: 'AXS',   name: 'Axie Infinity',       marketCap:    1 },
  { symbol: 'SAND',  name: 'The Sandbox',         marketCap:    1 },
  { symbol: 'MANA',  name: 'Decentraland',        marketCap:    1 },
  { symbol: 'FLOW',  name: 'Flow',                marketCap:    1 },
  { symbol: 'CHZ',   name: 'Chiliz',              marketCap:    1 },
];

// ── Fisher-Yates shuffle ────────────────────────────────────────────────────
function fisherYates(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Session queue — refills when empty so every coin appears before repeats ─
let cryptoQueue = [];

function refillCryptoQueue(skipSymbol = null) {
  const pool = skipSymbol
    ? CRYPTO_COINS.filter(c => c.symbol !== skipSymbol)
    : [...CRYPTO_COINS];
  cryptoQueue = fisherYates(pool);
}

function drawOneCrypto(skipSymbol = null) {
  if (skipSymbol) {
    const idx = cryptoQueue.findIndex(c => c.symbol === skipSymbol);
    if (idx !== -1) cryptoQueue.splice(idx, 1);
  }
  if (cryptoQueue.length === 0) refillCryptoQueue(skipSymbol);
  return cryptoQueue.shift();
}

/**
 * Returns { first, second } — two different coins.
 * Pass `excludeSymbol` to guarantee it doesn't appear in either slot.
 */
export function getRandomCryptoPair(excludeSymbol = null) {
  const first  = drawOneCrypto(excludeSymbol);
  const second = drawOneCrypto(first.symbol);
  return { first, second };
}
