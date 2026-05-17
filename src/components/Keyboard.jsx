import { useEffect, useCallback, useRef } from 'react';
import { useGame } from '../context/index.jsx';
import { playSoundKeyPress, playSoundError } from '../utils/soundEffects';

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

/**
 * hidden — true while the How to Play section is visible.
 *   • Slides the keyboard below the viewport (CSS transform).
 *   • Blocks all touch / physical key input so the game state is untouched.
 *   • The ResizeObserver still runs so --keyboard-height stays accurate.
 */
export default function Keyboard({ hidden = false }) {
  const {
    addLetter, deleteLetter, submitGuess,
    guesses, evaluations, gameOver,
    soundEnabled, soundVolume,
  } = useGame();

  const kbRef = useRef(null);

  // Measure rendered height → --keyboard-height CSS var used by the grid.
  useEffect(() => {
    const el = kbRef.current;
    if (!el) return;
    const sync = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--keyboard-height', `${h}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Build per-letter colour state from past guesses
  const letterStates = {};
  guesses.forEach((guess, i) => {
    const evaluation = evaluations[i];
    guess.split('').forEach((letter, j) => {
      const state = evaluation[j];
      const current = letterStates[letter];
      if (state === 'correct') letterStates[letter] = 'correct';
      else if (state === 'partial' && current !== 'correct') letterStates[letter] = 'partial';
      else if (state === 'wrong' && !current) letterStates[letter] = 'wrong';
    });
  });

  const handleKeyPress = useCallback((key) => {
    if (gameOver || hidden) return; // ignore input while How to Play is showing
    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'DEL' || key === 'BACKSPACE') {
      deleteLetter();
      if (soundEnabled) playSoundKeyPress(soundVolume);
    } else if (/^[A-Z]$/.test(key)) {
      addLetter(key);
      if (soundEnabled) playSoundKeyPress(soundVolume);
    }
  }, [addLetter, deleteLetter, submitGuess, gameOver, soundEnabled, soundVolume, hidden]);

  // Physical keyboard — re-registers whenever hidden changes so the closure
  // always reads the current value (no stale-closure issue).
  useEffect(() => {
    const handler = (e) => {
      if (hidden) return; // block all keys while How to Play is visible
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.body.hasAttribute('data-modal-open')) return;
      const key = e.key.toUpperCase();
      if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
        e.preventDefault();
        handleKeyPress(key);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKeyPress, hidden]);

  return (
    <div
      ref={kbRef}
      className="fixed bottom-0 left-0 right-0 z-40 bg-terminal-bg border-t border-terminal-border"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        // Slide down out of frame when How to Play is visible; snap back instantly
        // once returning to the game section.
        transform: hidden ? 'translateY(105%)' : 'translateY(0)',
        transition: hidden
          ? 'transform 0.28s cubic-bezier(0.4, 0, 1, 1)'   // quick ease-in exit
          : 'transform 0.32s cubic-bezier(0, 0, 0.2, 1)',   // decelerate entrance
      }}
    >
      <div className="w-full max-w-lg mx-auto px-1 pt-2 pb-2">
        {KEYBOARDROWS.map((row, i) => (
          <div key={i} className="flex gap-1 mb-1.5">
            {row.map((key) => {
              const isWide = key === 'ENTER' || key === 'DEL';
              const state = letterStates[key] || 'unused';
              return (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  disabled={gameOver || hidden}
                  className={`
                    ${isWide ? 'flex-[1.5] text-[11px]' : 'flex-1'}
                    h-12 sm:h-14
                    min-w-0 rounded-md font-semibold text-sm
                    transition-colors duration-150 active:scale-95
                    disabled:opacity-50
                    ${keyStateStyles[state]}
                    ${state !== 'unused' ? 'text-white' : 'text-terminal-text'}
                  `}
                >
                  {key === 'DEL' ? (
                    <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                    </svg>
                  ) : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
