import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { generateShareText } from '../utils/gameLogic';

export default function ShareButton() {
  const { guesses, evaluations, mode, puzzleNumber, won, streak } = useGame();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const text = generateShareText(guesses, evaluations, mode === 'daily', puzzleNumber, won, streak);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-correct hover:bg-correct/90 text-white font-semibold rounded-lg transition-colors"
      >
        Share
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={handleBackdropClick}
        >
          <div className="bg-terminal-surface border border-terminal-border rounded-lg p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-bold font-mono text-terminal-text mb-4">Results</h2>

            <pre className="font-mono text-2xl leading-tight text-center mb-6 select-all">
              {text}
            </pre>

            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className={`flex-1 py-2.5 font-semibold rounded-lg transition-colors ${
                  copied
                    ? 'bg-correct/80 text-white'
                    : 'bg-correct hover:bg-correct/90 text-white'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 bg-terminal-border hover:bg-terminal-muted/30 text-terminal-text font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
