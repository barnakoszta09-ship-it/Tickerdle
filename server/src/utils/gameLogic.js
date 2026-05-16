export const MAX_ATTEMPTS = 6;

/**
 * Evaluate a guess against the target.
 * Returns an array of 'correct' | 'partial' | 'wrong' for each position.
 * Identical algorithm to the frontend — kept in sync manually.
 */
export function evaluateGuess(guess, target) {
  const g = guess.toUpperCase().split('');
  const t = target.toUpperCase().split('');
  const result = new Array(t.length).fill(null);
  const used   = new Array(t.length).fill(false);

  // Pass 1: exact matches (green)
  for (let i = 0; i < t.length; i++) {
    if (g[i] === t[i]) {
      result[i] = 'correct';
      used[i]   = true;
    }
  }

  // Pass 2: wrong-position and absent (yellow / gray)
  for (let i = 0; i < t.length; i++) {
    if (result[i]) continue;
    const idx = t.findIndex((letter, j) => letter === g[i] && !used[j]);
    if (idx !== -1) {
      result[i]  = 'partial';
      used[idx]  = true;
    } else {
      result[i] = 'wrong';
    }
  }

  return result;
}
