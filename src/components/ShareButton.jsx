import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { generateShareText } from '../utils/gameLogic';

export default function ShareButton() {
  const { guesses, evaluations, mode, puzzleNumber, won } = useGame();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = generateShareText(
      guesses,
      evaluations,
      mode === 'daily',
      puzzleNumber,
      won
    );

    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="px-6 py-3 bg-correct hover:bg-correct/90 text-white font-semibold rounded-lg transition-colors"
    >
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}
