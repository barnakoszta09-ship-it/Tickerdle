export const TICKERS = [
  'AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOG', 'META', 'NFLX',
  'PYPL', 'INTC', 'CSCO', 'ORCL', 'ADBE', 'UBER', 'LYFT', 'SNAP',
  'PINS', 'SPOT', 'SHOP', 'ZOOM', 'DOCU', 'ROKU', 'PLTR', 'COIN',
  'HOOD', 'DKNG', 'RBLX', 'ABNB', 'DASH', 'PATH', 'SNOW', 'CRWD',
  'OKTA', 'DDOG', 'TEAM', 'TWLO', 'WDAY', 'SPLK', 'VEEV', 'ANSS',
  'CDNS', 'SNPS', 'KLAC', 'LRCX', 'AMAT', 'ASML', 'MRVL', 'AVGO',
  'QCOM', 'SWKS', 'QRVO', 'XLNX', 'MCHP', 'MPWR', 'SLAB', 'CRUS',
  'WOLF', 'ENPH', 'SEDG', 'FSLR', 'SPWR', 'PLUG', 'BLNK', 'CHPT',
  'RIVN', 'LCID', 'XPEV', 'WKHS', 'RIDE', 'ARVL', 'GOEV', 'FFIE',
  'BABA', 'BIDU', 'BILI', 'DIDI', 'FUTU', 'HUYA', 'VNET', 'VIPS',
  'WISH', 'EBAY', 'ETSY', 'CHWY', 'WOOF', 'BARK', 'FIGS', 'LULU',
  'DECK', 'CROX', 'BIRD', 'ONON', 'YETI', 'BROS', 'SHAK', 'CAVA',
  'WING', 'PLAY', 'BOWL', 'DENN', 'CAKE', 'TXRH', 'BLMN', 'RUTH',
  'SBUX', 'DNKN', 'PZZA', 'JACK', 'ARCO', 'TACO', 'LOCO', 'WING',
  'COST', 'FIVE', 'DLTR', 'OLLI', 'ULTA', 'SFIX', 'RENT', 'REAL',
  'OPEN', 'RDFN', 'EXPI', 'FTHM', 'COMP', 'GHLD', 'UWMC', 'SOFI',
  'UPST', 'AFRM', 'LMND', 'ROOT', 'HIPO', 'EVER', 'KINS', 'RELY',
  'BILL', 'FOUR', 'PAYX', 'PAYC', 'PCTY', 'HUBS', 'XERO', 'INTU',
  'ADSK', 'FIGM', 'FROG', 'GTLB', 'CFLT', 'ESTC', 'NEWR', 'SUMO',
  'DOMO', 'PLAN', 'COUP', 'CDAY', 'ASAN', 'MNDY', 'SMAR', 'CLDR',
  'ALTR', 'PEGA', 'APPN', 'BLZE', 'BASE', 'KVYO', 'BRZE', 'PCOR',
  'MELI', 'STNE', 'PAGS', 'GLOB', 'DESP', 'VTEX', 'CSAN', 'EGHT',
  'TWST', 'BEAM', 'CRSP', 'NTLA', 'EDIT', 'VERV', 'INZY', 'BLUE',
  'SGEN', 'EXEL', 'VRTX', 'REGN', 'GILD', 'BIIB', 'AMGN', 'MRNA',
  'BNTX', 'NVAX', 'ARCT', 'CVAC', 'VXRT', 'OCGN', 'CLOV', 'HIMS',
  'DOCS', 'TDOC', 'AMWL', 'TALK', 'CERT', 'ACCD', 'LFST', 'ISRG',
  'DXCM', 'PODD', 'TNDM', 'NVCR', 'AXNX', 'NVRO', 'IRTC', 'INMD',
  'ALGN', 'XRAY', 'HSIC', 'PDCO', 'OMCL', 'VEEV', 'HCAT', 'PHYS',
  'PSLV', 'PPLT', 'SIVR', 'SGOL', 'AAAU', 'GLDM', 'IAUM', 'OUNZ',
  'JETS', 'AWAY', 'CRUZ', 'BOAT', 'SPCX', 'ARKK', 'ARKW', 'ARKF',
  'ARKG', 'ARKQ', 'ARKX', 'PRNT', 'IZRL', 'MOON', 'SARK', 'TARK',
  'SQQQ', 'TQQQ', 'SPXL', 'SPXS', 'UPRO', 'SPXU', 'UDOW', 'SDOW',
  'LABU', 'LABD', 'SOXL', 'SOXS', 'FNGU', 'FNGD', 'WEBL', 'WEBS',
  'CURE', 'DRIP', 'GUSH', 'NRGU', 'OILU', 'OILD', 'ERSX', 'VIXM',
  'VIXY', 'UVXY', 'SVXY', 'SVIX', 'VIIX', 'VXUS', 'SPHD', 'JEPI',
  'JEPQ', 'XYLD', 'QYLD', 'RYLD', 'DIVO', 'SCHD', 'DGRO', 'NOBL'
];

// Get today's date as a seed for the daily puzzle
export function getDailySeed() {
  const now = new Date();
  const start = new Date(2024, 0, 1);
  const diff = now - start;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days;
}

// Get the daily ticker
export function getDailyTicker() {
  const seed = getDailySeed();
  return TICKERS[seed % TICKERS.length];
}

// Get a random ticker for endless mode
export function getRandomTicker(exclude = []) {
  const available = TICKERS.filter(t => !exclude.includes(t));
  return available[Math.floor(Math.random() * available.length)];
}

// Check if a ticker is valid
export function isValidTicker(ticker) {
  return TICKERS.includes(ticker.toUpperCase());
}
