const LEADERBOARD_STORAGE_KEY = 'tickerdle_leaderboard';

function getLeaderboardData() {
  const stored = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
  return stored ? JSON.parse(stored) : { daily: [], endless: [], 'higher-lower': [] };
}

function saveLeaderboardData(data) {
  localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(data));
}

export function saveScore(mode, playerName, score) {
  const data = getLeaderboardData();
  
  const entry = {
    playerName,
    score,
    date: new Date().toISOString(),
    id: Date.now(),
  };

  if (!data[mode]) {
    data[mode] = [];
  }

  data[mode].push(entry);
  
  // Sort by score descending
  data[mode].sort((a, b) => b.score - a.score);
  
  // Keep top 100 (we'll show top 10)
  data[mode] = data[mode].slice(0, 100);

  saveLeaderboardData(data);
}

export function getLeaderboard(mode) {
  const data = getLeaderboardData();
  return (data[mode] || []).slice(0, 10).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

export function clearLeaderboard(mode) {
  const data = getLeaderboardData();
  data[mode] = [];
  saveLeaderboardData(data);
}
