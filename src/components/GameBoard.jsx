import { useEffect } from 'react';
import { useGame } from '../context/index.jsx';
import Tile from './Tile';
import { MAXATTEMPTS, WORDLENGTH } from '../utils/gameLogic.js';
import { playSoundError, playSoundCorrect, playSoundWrong, playSoundWin } from '../utils/soundEffects';

export default function GameBoard() {
  const {
    guesses, evaluations, currentGuess, shake, revealRow, won, target, gameOver,
    soundEnabled, soundVolume,
    revealedLetterPos, revealedLetterChar,
  } = useGame();
  const tickerLength = target ? target.length : WORDLENGTH;

  // Play shake sound for invalid ticker
  useEffect(() => {
    if (shake && soundEnabled) {
      playSoundError(soundVolume);
    }
  }, [shake, soundEnabled, soundVolume]);

  // Play correct/wrong sounds when revealing tiles
  useEffect(() => {
    if (revealRow !== null && evaluations[revealRow] && soundEnabled) {
      const evaluation = evaluations[revealRow];
      const hasCorrect = evaluation.some(e => e === 'correct');
      const isLastGuess = revealRow === guesses.length - 1;
      
      // Add delay for sound to play after flip animation completes
      const id = setTimeout(() => {
        if (hasCorrect && isLastGuess && won) {
          playSoundWin(soundVolume);
        } else if (isLastGuess && gameOver && !won) {
          playSoundWrong(soundVolume);
        } else if (hasCorrect) {
          playSoundCorrect(soundVolume * 0.7);
        } else {
          playSoundWrong(soundVolume * 0.6);
        }
      }, 100 + tickerLength * 100); // Wait for tile flip animations
      return () => clearTimeout(id);
    }
  }, [revealRow, evaluations, won, gameOver, soundEnabled, soundVolume, guesses.length, tickerLength]);

  const rows = [];
  
  for (let i = 0; i < MAXATTEMPTS; i++) {
    const isCurrentRow = i === guesses.length;
    const isPastRow = i < guesses.length;
    const guess = isPastRow ? guesses[i] : (isCurrentRow ? currentGuess : '');
    const evaluation = isPastRow ? evaluations[i] : null;
    
    // For the current (unfilled) row: if a letter is locked, build a per-slot
    // array so empty free-slots don't collapse the string and push the locked
    // letter to the wrong index (e.g. 'C'+''+' S' → 'CS', length 2, not 3).
    let displayLetters = null;
    if (isCurrentRow && revealedLetterPos !== null && revealedLetterChar !== null) {
      displayLetters = new Array(tickerLength).fill('');
      let freeIdx = 0;
      for (let k = 0; k < tickerLength; k++) {
        displayLetters[k] = k === revealedLetterPos
          ? revealedLetterChar
          : (currentGuess[freeIdx++] || '');
      }
    }

    const tiles = [];
    for (let j = 0; j < tickerLength; j++) {
      const isLockedPos = isCurrentRow && revealedLetterPos === j && revealedLetterChar !== null;
      const letter = isPastRow
        ? (guess[j] || '')
        : isCurrentRow
          ? (displayLetters ? displayLetters[j] : (currentGuess[j] || ''))
          : '';
      const tileState = evaluation
        ? evaluation[j]
        : (isLockedPos ? 'correct' : (letter ? 'filled' : 'empty'));

      tiles.push(
        <Tile
          key={j}
          letter={letter}
          state={tileState}
          delay={j * 150}
          shouldAnimate={revealRow === i}
          tickerLength={tickerLength}
        />
      );
    }

    const isWinRow = won && i === guesses.length - 1 && revealRow === i;
    
    rows.push(
      <div
        key={i}
        className={`
          flex
          ${isCurrentRow && shake ? 'row-shake' : ''}
          ${isWinRow ? 'win-bounce' : ''}
        `}
        style={{ gap: 'var(--row-gap, 6px)' }}
      >
        {tiles}
      </div>
    );
  }

  return (
    // No internal padding — the parent flex container centres this block
    // vertically in the available space above the fixed keyboard.
    <div
      className="flex flex-col items-center"
      style={{ gap: 'var(--row-gap, 6px)' }}
    >
      {rows}
    </div>
  );
}
