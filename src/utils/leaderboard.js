const API_BASE = import.meta.env.VITE_API_URL ?? '';

/**
 * Submit a score to the server.
 * Silently ignores network failures — leaderboard is non-critical.
 */
export async function saveScore(mode, playerId, playerName, score) {
  try {
    await fetch(`${API_BASE}/api/leaderboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, playerId, playerName, score }),
    });
  } catch {}
}

/**
 * Fetch top 10 entries for a given mode from the server.
 * Returns [] on failure.
 */
export async function getLeaderboard(mode) {
  try {
    const res = await fetch(`${API_BASE}/api/leaderboard/${encodeURIComponent(mode)}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
