// Fetches current market caps via yahoo-finance2
// Run with: node scripts/fetch-marketcaps.mjs

import { default as lib } from 'yahoo-finance2';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const yf = new lib({ suppressNotices: ['yahooSurvey'] });
const __dirname = dirname(fileURLToPath(import.meta.url));

// Tickers in sp500.js — with corrections:
//   ZOOM → ZM (real Zoom ticker), ROBLOX → RBLX, SPLK removed (acquired by Cisco 2024)
const entries = [
  { symbol: 'AAPL',  name: 'Apple' },
  { symbol: 'MSFT',  name: 'Microsoft' },
  { symbol: 'NVDA',  name: 'NVIDIA' },
  { symbol: 'GOOG',  name: 'Alphabet' },
  { symbol: 'AMZN',  name: 'Amazon' },
  { symbol: 'META',  name: 'Meta' },
  { symbol: 'TSLA',  name: 'Tesla' },
  { symbol: 'AVGO',  name: 'Broadcom' },
  { symbol: 'V',     name: 'Visa' },
  { symbol: 'JNJ',   name: 'Johnson & Johnson' },
  { symbol: 'WMT',   name: 'Walmart' },
  { symbol: 'MA',    name: 'Mastercard' },
  { symbol: 'ORCL',  name: 'Oracle' },
  { symbol: 'ASML',  name: 'ASML' },
  { symbol: 'XOM',   name: 'ExxonMobil' },
  { symbol: 'GOOGL', name: 'Alphabet Class A' },
  { symbol: 'PG',    name: 'Procter & Gamble' },
  { symbol: 'KO',    name: 'Coca-Cola' },
  { symbol: 'COST',  name: 'Costco' },
  { symbol: 'GE',    name: 'GE Aerospace' },
  { symbol: 'MCD',   name: "McDonald's" },
  { symbol: 'INTC',  name: 'Intel' },
  { symbol: 'AMD',   name: 'AMD' },
  { symbol: 'QCOM',  name: 'Qualcomm' },
  { symbol: 'ADBE',  name: 'Adobe' },
  { symbol: 'CRM',   name: 'Salesforce' },
  { symbol: 'CSCO',  name: 'Cisco' },
  { symbol: 'IBM',   name: 'IBM' },
  { symbol: 'NFLX',  name: 'Netflix' },
  { symbol: 'PYPL',  name: 'PayPal' },
  { symbol: 'SHOP',  name: 'Shopify' },
  { symbol: 'ZM',    name: 'Zoom' },
  { symbol: 'UBER',  name: 'Uber' },
  { symbol: 'ABNB',  name: 'Airbnb' },
  { symbol: 'SPOT',  name: 'Spotify' },
  { symbol: 'LYFT',  name: 'Lyft' },
  { symbol: 'SNAP',  name: 'Snap' },
  { symbol: 'PINS',  name: 'Pinterest' },
  { symbol: 'TWLO',  name: 'Twilio' },
  { symbol: 'RBLX',  name: 'Roblox' },
  { symbol: 'PLTR',  name: 'Palantir' },
  { symbol: 'DDOG',  name: 'Datadog' },
  { symbol: 'CRWD',  name: 'CrowdStrike' },
  { symbol: 'OKTA',  name: 'Okta' },
  { symbol: 'SNOW',  name: 'Snowflake' },
  { symbol: 'TEAM',  name: 'Atlassian' },
  { symbol: 'WDAY',  name: 'Workday' },
  { symbol: 'ANSS',  name: 'ANSYS' },
  { symbol: 'CDNS',  name: 'Cadence Design' },
  { symbol: 'SNPS',  name: 'Synopsys' },
];

async function fetchCap(symbol) {
  try {
    const q = await yf.quote(symbol);
    const cap = q?.marketCap;
    if (!cap || cap === 0) return null;
    return Math.round(cap / 1e9); // convert to billions
  } catch {
    return null;
  }
}

async function main() {
  console.log(`Fetching market caps for ${entries.length} tickers...\n`);
  const results = [];
  const skipped = [];

  for (const { symbol, name } of entries) {
    const cap = await fetchCap(symbol);
    await new Promise(r => setTimeout(r, 150)); // rate limit courtesy delay

    if (cap === null) {
      skipped.push(symbol);
      console.log(`  ⚠️  ${symbol.padEnd(6)} — skipped (not found or no cap data)`);
    } else {
      results.push({ symbol, name, marketCap: cap });
      console.log(`  ✅  ${symbol.padEnd(6)} $${cap}B`);
    }
  }

  console.log(`\n${results.length} fetched, ${skipped.length} skipped${skipped.length ? ': ' + skipped.join(', ') : ''}`);

  const lines = results.map(r =>
    `  { symbol: '${r.symbol}', name: '${r.name.replace(/'/g, "\\'")}', marketCap: ${r.marketCap} },`
  ).join('\n');

  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const output = `// S&P 500 companies with market caps (in billions USD)
// Data fetched ${dateStr}
export const SP500_COMPANIES = [
${lines}
];

export function getRandomHLPair(excludeSymbol = null) {
  const filtered = excludeSymbol
    ? SP500_COMPANIES.filter(c => c.symbol !== excludeSymbol)
    : SP500_COMPANIES;
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return {
    first: shuffled[0],
    second: shuffled[1],
  };
}

export function getCompanyBySymbol(symbol) {
  return SP500_COMPANIES.find(c => c.symbol === symbol);
}
`;

  const outPath = join(__dirname, '..', 'src', 'utils', 'sp500.js');
  writeFileSync(outPath, output, 'utf8');
  console.log(`\n✅ Written to src/utils/sp500.js`);
}

main();
