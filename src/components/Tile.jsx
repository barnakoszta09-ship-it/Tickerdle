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

export default function Tile({ letter, state = 'empty', delay = 0, shouldAnimate = false }) {
  const { soundEnabled, soundVolume } = useGame();
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
      className={`
        w-14 h-14 sm:w-16 sm:h-16
        flex items-center justify-center
        border-2 rounded-md
        font-mono font-bold text-2xl sm:text-3xl
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
