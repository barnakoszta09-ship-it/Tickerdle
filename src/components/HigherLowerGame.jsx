import { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { saveScore } from '../utils/leaderboard';
import { playSoundCorrect, playSoundWrong, playSoundWin, playSoundLose } from '../utils/soundEffects';

export default function HigherLowerGame() {
  const {
    hlCurrent, hlNext, hlStreak, hlGuessed, hlShowMarketCap,
    makeHLGuess, hlGameOver, resetGame,
    playerName, playerId, scoreSubmitted, setScoreSubmitted,
    soundEnabled, soundVolume,
  } = useGame();
  const [message, setMessage] = useState('');
  const hasScoreSaved = useRef(false);

  const handleGuess = (guess) => {
    makeHLGuess(guess);
  };

  useEffect(() => {
    if (hlGuessed !== null) {
      if (hlGuessed) {
        setMessage('✓ Correct!');
        if (soundEnabled) playSoundCorrect(soundVolume);
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
      saveScore('higher-lower', playerId, playerName, hlStreak);
      setScoreSubmitted();
      hasScoreSaved.current = true;
    }
  }, [hlGameOver, hlStreak, playerName, playerId, scoreSubmitted, soundEnabled, soundVolume]);

  if (!hlCurrent || !hlNext) {
    return <div>Loading...</div>;
  }

  const isCorrect = hlGuessed === true;
  const isWrong = hlGuessed === false;
  const shouldShowMarketCap = hlShowMarketCap && hlGuessed !== null;

  const handlePlayAgain = () => {
    hasScoreSaved.current = false;
    resetGame();
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-8">
      <div className="text-center">
        <p className="text-xs uppercase text-terminal-muted mb-4">Current Market Cap</p>
        <div className="text-4xl font-bold font-mono text-terminal-text mb-2">
          {hlCurrent.symbol}
        </div>
        <p className="text-lg text-terminal-muted">{hlCurrent.name}</p>
        <div className="text-2xl font-bold text-correct mt-2">
          ${hlCurrent.marketCap}B
        </div>
      </div>

      <div className="text-2xl text-terminal-muted">↓</div>

      <div className="text-center">
        <p className="text-xs uppercase text-terminal-muted mb-4">Next Company</p>
        <div className="text-4xl font-bold font-mono text-terminal-text mb-2">
          {hlNext.symbol}
        </div>
        <p className="text-lg text-terminal-muted">{hlNext.name}</p>
        <div className={`text-2xl font-bold mt-2 ${isCorrect ? 'text-correct' : isWrong ? 'text-partial' : 'text-terminal-text'}`}>
          {shouldShowMarketCap ? `$${hlNext.marketCap}B` : '?'}
        </div>
      </div>

      <div className={`text-lg font-bold h-7 ${
        hlGameOver ? 'text-partial' : message ? (message.includes('Correct') ? 'text-correct' : 'text-partial') : 'invisible'
      }`}>
        {hlGameOver ? 'Game Over!' : message}
      </div>

      <div className="flex flex-col items-center gap-3">
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
        <p className={`text-sm text-terminal-muted h-5 ${hlGameOver ? '' : 'invisible'}`}>
          Final Streak: {hlStreak}
        </p>
      </div>

      <div className="text-center mt-8">
        <p className="text-xs uppercase text-terminal-muted">Streak</p>
        <p className="text-3xl font-bold font-mono text-correct">{hlStreak}</p>
      </div>
    </div>
  );
}
