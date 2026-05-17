import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { playSoundTileFlip } from '../utils/soundEffects';

const stateStyles = {
  empty: 'border-terminal-border bg-transparent',
  filled: 'border-terminal-muted bg-transparent',
  correct: 'border-correct bg-correct-muted',
  partial: 'border-partial bg-partial-muted',
  wrong: 'border-wrong bg-wrong',
};

/*
 * Tile size is driven by CSS custom properties so that @media (max-height)
 * rules in index.css can shrink tiles on short screens without touching
 * the keyboard size at all.
 *
 * Variable names: --tile-size-2  --tile-size-3  --tile-size-4  --tile-size-5
 * Font size:      --tile-font
 */
function getTileSizeStyle(tickerLength) {
  const len = Math.min(Math.max(tickerLength, 2), 5); // clamp to [2, 5]
  return {
    width:    `var(--tile-size-${len})`,
    height:   `var(--tile-size-${len})`,
    fontSize: 'var(--tile-font)',
  };
}

export default function Tile({ letter, state = 'empty', delay = 0, shouldAnimate = false, tickerLength = 4 }) {
  const { soundEnabled, soundVolume } = useGame();
  const sizeStyle = getTileSizeStyle(tickerLength);
  const [revealed, setRevealed] = useState(!shouldAnimate);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (shouldAnimate && !revealed) {
      const flipTimer = setTimeout(() => {
        setIsFlipping(true);
        if (soundEnabled) playSoundTileFlip(soundVolume * 0.8);
      }, delay);

      const revealTimer = setTimeout(() => {
        setRevealed(true);
        setIsFlipping(false);
      }, delay + 250);

      return () => {
        clearTimeout(flipTimer);
        clearTimeout(revealTimer);
      };
    }
  }, [shouldAnimate, revealed, delay, soundEnabled, soundVolume, letter, state]);

  const currentState = revealed ? state : (letter ? 'filled' : 'empty');

  return (
    <div
      style={sizeStyle}
      className={`
        flex items-center justify-center
        border-2 rounded-md
        font-mono font-bold
        transition-all duration-200
        ${stateStyles[currentState]}
        ${isFlipping ? 'tile-flip flipping' : ''}
        ${letter && !revealed ? 'animate-pop' : ''}
      `}
    >
      <span className={revealed && state !== 'empty' && state !== 'filled' ? 'text-white' : 'text-terminal-text'}>
        {letter}
      </span>
    </div>
  );
}
