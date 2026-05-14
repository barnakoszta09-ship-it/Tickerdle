import { useEffect, useCallback } from 'react';
import { useGame } from '../context/index.jsx';

const KEYBOARDROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
];

const keyStateStyles = {
  unused: 'bg-terminal-surface hover:bg-terminal-border',
  correct: 'bg-correct-muted hover:bg-correct',
  partial: 'bg-partial-muted hover:bg-partial',
  wrong: 'bg-wrong hover:bg-terminal-border',
};

export default function Keyboard() {
  const { addLetter, deleteLetter, submitGuess, guesses, evaluations, gameOver } = useGame();

  // Build letter states from past guesses
  const letterStates = {};
  guesses.forEach((guess, i) => {
    const evaluation = evaluations[i];
    guess.split('').forEach((letter, j) => {
      const state = evaluation[j];
      const current = letterStates[letter];
      
      // Priority: correct > partial > wrong
      if (state === 'correct') {
        letterStates[letter] = 'correct';
      } else if (state === 'partial' && current !== 'correct') {
        letterStates[letter] = 'partial';
      } else if (state === 'wrong' && !current) {
        letterStates[letter] = 'wrong';
      }
    });
  });

  const handleKeyPress = useCallback((key) => {
    if (gameOver) return;
    
    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'DEL' || key === 'BACKSPACE') {
      deleteLetter();
    } else if (/^[A-Z]$/.test(key)) {
      addLetter(key);
    }
  }, [addLetter, deleteLetter, submitGuess, gameOver]);

  // Physical keyboard support
  useEffect(() => {
    const handler = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      
      const key = e.key.toUpperCase();
      if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
        e.preventDefault();
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKeyPress]);

  return (
    <div className="w-full max-w-lg mx-auto px-1 pb-2">
      {KEYBOARDROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1 mb-1.5">
          {row.map((key) => {
            const isWide = key === 'ENTER' || key === 'DEL';
            const state = letterStates[key] || 'unused';
            
            return (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                disabled={gameOver}
                className={`
                  ${isWide ? 'px-3 text-xs' : 'w-8 sm:w-10'}
                  h-12 sm:h-14
                  rounded-md
                  font-semibold text-sm
                  transition-colors duration-150
                  active:scale-95
                  disabled:opacity-50
                  ${keyStateStyles[state]}
                  ${state !== 'unused' ? 'text-white' : 'text-terminal-text'}
                `}
              >
                {key === 'DEL' ? (
                  <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                  </svg>
                ) : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
