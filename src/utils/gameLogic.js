export const WORDLENGTH = 4;
export const MAXATTEMPTS = 6;

export function evaluateGuess(guess, target) {
  const result = [];
  const targetLetters = target.split('');
  const guessLetters = guess.toUpperCase().split('');
  const targetLength = target.length;
  const used = new Array(targetLength).fill(false);

  // First pass: find correct positions (green)
  for (let i = 0; i < targetLength; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = 'correct';
      used[i] = true;
    }
  }

  // Second pass: find wrong positions (yellow) and wrong letters (gray)
  for (let i = 0; i < targetLength; i++) {
    if (result[i]) continue;

    const letterIndex = targetLetters.findIndex(
      (letter, j) => letter === guessLetters[i] && !used[j]
    );

    if (letterIndex !== -1) {
      result[i] = 'partial';
      used[letterIndex] = true;
    } else {
      result[i] = 'wrong';
    }
  }

  return result;
}

export function generateShareText(guesses, evaluations, isDaily, puzzleNumber, won, streak) {
  const title = isDaily ? 'Tickerdle Daily' : 'Tickerdle Endless';

  const score = won
    ? `${guesses.length}/${MAXATTEMPTS}`
    : 'X/6';

  const streakLine = streak > 0 ? `🔥 Streak: ${streak}\n` : '';

  const grid = evaluations.map(row =>
    row.map(state => {
      switch (state) {
        case 'correct': return '🟩';
        case 'partial': return '🟨';
        default: return '⬛';
      }
    }).join('')
  ).join('\n');

  return `${title} ${score}\n${streakLine}\n${grid}\n\nhttps://tickerdle.org`;
}
