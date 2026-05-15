// S&P 500 companies with approximate market caps (in billions USD)
// Data approximate as of May 2026
export const SP500_COMPANIES = [
  { symbol: 'AAPL', name: 'Apple', marketCap: 3200 },
  { symbol: 'MSFT', name: 'Microsoft', marketCap: 3100 },
  { symbol: 'NVDA', name: 'NVIDIA', marketCap: 2800 },
  { symbol: 'GOOG', name: 'Alphabet', marketCap: 2200 },
  { symbol: 'AMZN', name: 'Amazon', marketCap: 2100 },
  { symbol: 'META', name: 'Meta', marketCap: 1300 },
  { symbol: 'TSLA', name: 'Tesla', marketCap: 1200 },
  { symbol: 'AVGO', name: 'Broadcom', marketCap: 760 },
  { symbol: 'V', name: 'Visa', marketCap: 650 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', marketCap: 620 },
  { symbol: 'WMT', name: 'Walmart', marketCap: 440 },
  { symbol: 'MA', name: 'Mastercard', marketCap: 520 },
  { symbol: 'ORCL', name: 'Oracle', marketCap: 480 },
  { symbol: 'ASML', name: 'ASML', marketCap: 380 },
  { symbol: 'XOM', name: 'ExxonMobil', marketCap: 530 },
  { symbol: 'GOOGL', name: 'Alphabet Class A', marketCap: 2200 },
  { symbol: 'PG', name: 'Procter & Gamble', marketCap: 420 },
  { symbol: 'KO', name: 'Coca-Cola', marketCap: 310 },
  { symbol: 'COST', name: 'Costco', marketCap: 380 },
  { symbol: 'GE', name: 'General Electric', marketCap: 320 },
  { symbol: 'MCD', name: "McDonald's", marketCap: 210 },
  { symbol: 'INTC', name: 'Intel', marketCap: 240 },
  { symbol: 'AMD', name: 'AMD', marketCap: 220 },
  { symbol: 'QCOM', name: 'Qualcomm', marketCap: 190 },
  { symbol: 'ADBE', name: 'Adobe', marketCap: 210 },
  { symbol: 'CRM', name: 'Salesforce', marketCap: 280 },
  { symbol: 'CSCO', name: 'Cisco', marketCap: 220 },
  { symbol: 'IBM', name: 'IBM', marketCap: 210 },
  { symbol: 'NFLX', name: 'Netflix', marketCap: 280 },
  { symbol: 'PYPL', name: 'PayPal', marketCap: 85 },
  { symbol: 'SHOP', name: 'Shopify', marketCap: 210 },
  { symbol: 'ZOOM', name: 'Zoom', marketCap: 45 },
  { symbol: 'UBER', name: 'Uber', marketCap: 150 },
  { symbol: 'ABNB', name: 'Airbnb', marketCap: 120 },
  { symbol: 'SPOT', name: 'Spotify', marketCap: 95 },
  { symbol: 'LYFT', name: 'Lyft', marketCap: 18 },
  { symbol: 'SNAP', name: 'Snap', marketCap: 26 },
  { symbol: 'PINS', name: 'Pinterest', marketCap: 39 },
  { symbol: 'TWLO', name: 'Twilio', marketCap: 22 },
  { symbol: 'ROBLOX', name: 'Roblox', marketCap: 48 },
  { symbol: 'PLTR', name: 'Palantir', marketCap: 95 },
  { symbol: 'DDOG', name: 'Datadog', marketCap: 55 },
  { symbol: 'CRWD', name: 'CrowdStrike', marketCap: 110 },
  { symbol: 'OKTA', name: 'Okta', marketCap: 24 },
  { symbol: 'SNOW', name: 'Snowflake', marketCap: 50 },
  { symbol: 'TEAM', name: 'Atlassian', marketCap: 65 },
  { symbol: 'SPLK', name: 'Splunk', marketCap: 32 },
  { symbol: 'WDAY', name: 'Workday', marketCap: 75 },
  { symbol: 'ANSS', name: 'ANSYS', marketCap: 48 },
  { symbol: 'CDNS', name: 'Cadence Design', marketCap: 42 },
  { symbol: 'SNPS', name: 'Synopsys', marketCap: 60 },
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
