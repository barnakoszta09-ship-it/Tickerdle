import { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import ShareButton from './ShareButton';
import { saveScore } from '../utils/leaderboard';

export default function Modal() {
  const {
    gameOver, won, target, mode, streak, dailyStreak, newEndlessGame, switchMode,
    puzzleNumber, guesses, playerName, playerId, scoreSubmitted, setScoreSubmitted,
  } = useGame();
  const [show, setShow] = useState(false);
  const hasScoreSaved = useRef(false);

  useEffect(() => {
    if (gameOver && !hasScoreSaved.current && !scoreSubmitted) {
      let score = 0;
      if (mode === 'daily') {
        score = won ? dailyStreak : 0;
      } else if (mode === 'endless') {
        score = streak;
      }
      if (score > 0) {
        saveScore(mode, playerId, playerName, score);
        setScoreSubmitted();
      }
      hasScoreSaved.current = true;
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    } else {
      if (!gameOver) hasScoreSaved.current = false;
      setShow(false);
    }
  }, [gameOver, mode, won, guesses, streak, playerName, playerId, scoreSubmitted]);

  if (!show) return null;

  const handleContinueEndless = () => {
    hasScoreSaved.current = false;
    setShow(false);
    switchMode('endless');
  };

  const handlePlayAgain = () => {
    hasScoreSaved.current = false;
    newEndlessGame();
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
              {mode === 'daily' && (
                <>
                  <div className="mt-3 mb-1 py-3 px-4 bg-terminal-bg rounded-lg font-mono text-sm">
                    <p className="text-xs text-terminal-muted uppercase tracking-wider mb-1">Daily streak</p>
                    <p className="text-2xl font-bold text-correct">🔥 {dailyStreak} {dailyStreak === 1 ? 'day' : 'days'}</p>
                  </div>
                  <p className="text-terminal-muted text-sm mt-2">
                    Come back tomorrow for a new puzzle!
                  </p>
                </>
              )}
            </>
          ) : (
            <>
              <div className="text-4xl mb-2">📉</div>
              <h2 className="text-xl font-bold text-terminal-text">Game Over</h2>
              <p className="text-terminal-muted mt-1">Better luck next time!</p>
            </>
          )}
        </div>

        {mode === 'endless' && streak > 0 && (
          <div className="mb-4 py-3 px-4 bg-terminal-bg rounded-lg">
            <p className="text-xs text-terminal-muted uppercase tracking-wider mb-1">
              {won ? 'Streak' : 'Streak Lost'}
            </p>
            <p className="text-2xl font-bold font-mono text-terminal-text">{streak}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <ShareButton />

          {mode === 'daily' && won ? (
            <button
              onClick={handleContinueEndless}
              className="px-6 py-3 bg-correct hover:bg-correct/90 text-white font-semibold rounded-lg transition-colors"
            >
              Continue in Endless
            </button>
          ) : mode === 'daily' && !won ? (
            <button
              onClick={handleContinueEndless}
              className="px-6 py-3 bg-correct hover:bg-correct/90 text-white font-semibold rounded-lg transition-colors"
            >
              Play Endless
            </button>
          ) : (
            <button
              onClick={handlePlayAgain}
              className="px-6 py-3 bg-correct hover:bg-correct/90 text-white font-semibold rounded-lg transition-colors"
            >
              Play Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
