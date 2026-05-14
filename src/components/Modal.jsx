import { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import ShareButton from './ShareButton';
import { saveScore } from '../utils/leaderboard';

export default function Modal() {
  const { gameOver, won, target, mode, streak, newEndlessGame, resetGame, puzzleNumber, guesses, playerName } = useGame();
  const [show, setShow] = useState(false);
  const hasScoreSaved = useRef(false);

  useEffect(() => {
    if (gameOver && !hasScoreSaved.current) {
      // Save score to leaderboard
      let score = 0;
      
      if (mode === 'daily') {
        // For daily, score is based on guesses (6 = perfect, 1 = worst)
        score = won ? Math.max(1, 7 - guesses.length) : 0;
      } else if (mode === 'endless') {
        // For endless, score is the streak
        score = streak;
      }
      
      if (score > 0) {
        saveScore(mode, playerName, score);
      }
      
      hasScoreSaved.current = true;
      
      // Delay modal to let animations complete
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [gameOver, mode, won, guesses, streak, playerName]);

  if (!show) return null;

  const handlePlayAgain = () => {
    hasScoreSaved.current = false;
    if (mode === 'endless') {
      newEndlessGame();
    } else {
      resetGame();
    }
    setShow(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-terminal-surface rounded-xl p-6 max-w-sm w-full text-center border border-terminal-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          {won ? (
            <>
              <div className="text-4xl mb-2">📈</div>
              <h2 className="text-xl font-bold text-terminal-text">
                {mode === 'daily' ? 'Well played!' : 'Correct!'}
              </h2>
              <p className="text-terminal-muted mt-1">
                {guesses.length === 1 ? 'First try!' : `Solved in ${guesses.length} guesses`}
              </p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-2">📉</div>
              <h2 className="text-xl font-bold text-terminal-text">Game Over</h2>
              <p className="text-terminal-muted mt-1">
                The ticker was <span className="font-mono font-bold text-correct">{target}</span>
              </p>
            </>
          )}
        </div>

        {mode === 'daily' && (
          <div className="mb-4 py-3 px-4 bg-terminal-bg rounded-lg">
            <p className="text-xs text-terminal-muted uppercase tracking-wider mb-1">
              Daily #{puzzleNumber}
            </p>
          </div>
        )}

        {mode === 'endless' && (
          <div className="mb-4 py-3 px-4 bg-terminal-bg rounded-lg">
            <p className="text-xs text-terminal-muted uppercase tracking-wider mb-1">Streak</p>
            <p className="text-2xl font-bold font-mono text-terminal-text">{streak}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <ShareButton />
          
          <button
            onClick={handlePlayAgain}
            className="px-6 py-3 bg-correct hover:bg-correct/90 text-white font-semibold rounded-lg transition-colors"
          >
            {mode === 'daily' ? 'Play Again Tomorrow' : 'Play Again'}
          </button>
          
          <button
            onClick={() => setShow(false)}
            className="text-terminal-muted hover:text-terminal-text text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
