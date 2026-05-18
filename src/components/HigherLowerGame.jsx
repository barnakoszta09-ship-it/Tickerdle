import { useEffect, useState, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { saveScore } from '../utils/leaderboard';
import { playSoundCorrect, playSoundWrong, playSoundWin, playSoundLose } from '../utils/soundEffects';

export default function HigherLowerGame() {
  const {
    hlCurrent, hlNext, hlStreak, hlGuessed, hlShowMarketCap,
    makeHLGuess, hlGameOver, resetGame, mode,
    playerName, playerId, scoreSubmitted, setScoreSubmitted,
    soundEnabled, soundVolume,
  } = useGame();
  const isCrypto = mode === 'crypto';
  const [message, setMessage] = useState('');
  const [streakPop, setStreakPop] = useState(false);
  const hasScoreSaved = useRef(false);

  const handleGuess = (guess) => {
    makeHLGuess(guess);
  };

  useEffect(() => {
    if (hlGuessed !== null) {
      if (hlGuessed) {
        setMessage('✓ Correct!');
        if (soundEnabled) playSoundCorrect(soundVolume);
        setStreakPop(true);
        setTimeout(() => setStreakPop(false), 400);
        setTimeout(() => setMessage(''), 1000);
      } else {
        setMessage('✗ Wrong!');
        if (soundEnabled) playSoundWrong(soundVolume);
        setTimeout(() => setMessage(''), 1500);
      }
    }
  }, [hlGuessed, soundEnabled, soundVolume]);

  useEffect(() => {
    if (hlGameOver && !hasScoreSaved.current && !scoreSubmitted) {
      if (soundEnabled) playSoundLose(soundVolume);
      saveScore(mode, playerId, playerName, hlStreak);
      setScoreSubmitted();
      hasScoreSaved.current = true;
    }
  }, [hlGameOver, hlStreak, playerName, playerId, scoreSubmitted, soundEnabled, soundVolume]);

  if (!hlCurrent || !hlNext) {
    return <div>Loading...</div>;
  }

  const isCorrect = hlGuessed === true;
  const isWrong = hlGuessed === false;
  const shouldShowMarketCap = hlGameOver || (hlShowMarketCap && hlGuessed !== null);

  const handlePlayAgain = () => {
    hasScoreSaved.current = false;
    resetGame();
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-4 w-full">
      <div className="text-center">
        <p className="text-xs uppercase text-terminal-muted mb-2">
          {isCrypto ? 'Current Market Cap' : 'Current Market Cap'}
        </p>
        <div className="text-4xl font-bold font-mono text-terminal-text mb-1">
          {hlCurrent.symbol}
        </div>
        <p className="text-base text-terminal-muted">{hlCurrent.name}</p>
        <div className="text-2xl font-bold text-correct mt-1">
          ${hlCurrent.marketCap}B
        </div>
      </div>

      <div className="text-xl text-terminal-muted">↓</div>

      <div className="text-center">
        <p className="text-xs uppercase text-terminal-muted mb-2">
          {isCrypto ? 'Next Cryptocurrency' : 'Next Company'}
        </p>
        <div className="text-4xl font-bold font-mono text-terminal-text mb-1">
          {hlNext.symbol}
        </div>
        <p className="text-base text-terminal-muted">{hlNext.name}</p>
        <div className={`text-2xl font-bold mt-1 ${isCorrect ? 'text-correct' : isWrong ? 'text-partial' : 'text-terminal-text'}`}>
          {shouldShowMarketCap ? `$${hlNext.marketCap}B` : '?'}
        </div>
      </div>

      {/* Streak — always visible, pops on correct answer */}
      <div className="flex flex-col items-center">
        <p className="text-[10px] uppercase tracking-widest text-terminal-muted mb-0.5">
          {hlGameOver ? 'Final Streak' : 'Streak'}
        </p>
        <p className={`text-5xl font-bold font-mono text-correct transition-transform duration-150 ${streakPop ? 'scale-125' : 'scale-100'}`}>
          {hlStreak > 0 && !hlGameOver ? '🔥' : ''}{hlStreak}
        </p>
      </div>

      <div className={`text-lg font-bold h-7 ${
        hlGameOver ? 'text-partial' : message ? (message.includes('Correct') ? 'text-correct' : 'text-partial') : 'invisible'
      }`}>
        {hlGameOver ? 'Game Over!' : message}
      </div>

      <div className="flex gap-4">
        {!hlGameOver ? (
          <>
            <button
              onClick={() => handleGuess('higher')}
              className="px-8 py-3 bg-terminal-border hover:bg-terminal-muted/30 text-terminal-text font-semibold rounded-lg transition-colors"
            >
              Higher
            </button>
            <button
              onClick={() => handleGuess('lower')}
              className="px-8 py-3 bg-terminal-border hover:bg-terminal-muted/30 text-terminal-text font-semibold rounded-lg transition-colors"
            >
              Lower
            </button>
          </>
        ) : (
          <button
            onClick={handlePlayAgain}
            className="px-8 py-3 bg-correct hover:bg-correct/90 text-white font-semibold rounded-lg transition-colors"
          >
            Play Again
          </button>
        )}
      </div>
    </div>
  );
}
