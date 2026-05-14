import { useGame } from '../context/index.jsx';
import Tile from './Tile';
import { MAXATTEMPTS, WORDLENGTH } from '../utils/gameLogic.js';

export default function GameBoard() {
  const { guesses, evaluations, currentGuess, shake, revealRow, won } = useGame();

  const rows = [];
  
  for (let i = 0; i < MAXATTEMPTS; i++) {
    const isCurrentRow = i === guesses.length;
    const isPastRow = i < guesses.length;
    const guess = isPastRow ? guesses[i] : (isCurrentRow ? currentGuess : '');
    const evaluation = isPastRow ? evaluations[i] : null;
    
    const tiles = [];
    for (let j = 0; j < WORDLENGTH; j++) {
      const letter = guess[j] || '';
      const state = evaluation ? evaluation[j] : (letter ? 'filled' : 'empty');
      
      tiles.push(
        <Tile
          key={j}
          letter={letter}
          state={state}
          delay={j * 150}
          shouldAnimate={revealRow === i}
        />
      );
    }

    const isWinRow = won && i === guesses.length - 1 && revealRow === i;
    
    rows.push(
      <div
        key={i}
        className={`
          flex gap-1.5
          ${isCurrentRow && shake ? 'row-shake' : ''}
          ${isWinRow ? 'win-bounce' : ''}
        `}
      >
        {tiles}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 items-center py-4">
      {rows}
    </div>
  );
}
