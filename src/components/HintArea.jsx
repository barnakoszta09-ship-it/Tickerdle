import { useMemo, useState } from 'react';
import { useGame } from '../context/GameContext';
import HintPanel from './HintPanel';
import AdRewardModal from './AdRewardModal';
import { MAXATTEMPTS } from '../utils/gameLogic';

// Set to true once AdSense is approved and rewarded ads are live
const ADS_ENABLED = false;

/**
 * Hint area — sits between the game grid and the How-to-Play nudge.
 * Only renders in daily and endless modes (never in H/L or leaderboard).
 *
 * Behaviour:
 *  • Auto-hint panel (sector + market cap) fades in after the 3rd wrong guess.
 *  • "🎯 Reveal a Letter" appears only on the 6th (final) guess while at least
 *    one position is still unresolved — clicking locks a random correct letter.
 */
export default function HintArea() {
  const {
    guesses, evaluations, won, gameOver, target, mode,
    revealedLetterPos, revealLetter,
  } = useGame();
  const [adOpen, setAdOpen] = useState(false);

  // Only show hints in wordle modes
  if (mode !== 'daily' && mode !== 'endless') return null;

  const autoHintVisible = guesses.length >= 3 && !won;
  const isOnLastGuess   = guesses.length === MAXATTEMPTS - 1;

  // Whether there is at least one position the player hasn't nailed yet
  const hasRevealablePositions = useMemo(() => {
    if (!target || !isOnLastGuess) return false;
    const correct = new Set();
    evaluations.forEach(row => row.forEach((e, i) => { if (e === 'correct') correct.add(i); }));
    return target.split('').some((_, i) => !correct.has(i));
  }, [target, evaluations, isOnLastGuess]);

  const showRevealBtn = ADS_ENABLED
    && isOnLastGuess && !won && !gameOver
    && revealedLetterPos === null
    && hasRevealablePositions;

  if (!autoHintVisible && !showRevealBtn) return null;

  return (
    <div className="flex flex-col items-center gap-1.5 px-4 pb-2 w-full max-w-lg mx-auto">

      {/* ── Auto hint panel ─────────────────────────────────────────────── */}
      {autoHintVisible && <HintPanel />}

      {/* ── 🎯 Reveal a Letter — only on the 6th guess, gated by an ad ──── */}
      {showRevealBtn && (
        <button
          onClick={() => setAdOpen(true)}
          className="px-4 py-1.5 rounded-md text-xs font-semibold border border-partial/60 text-partial bg-partial/10 hover:bg-partial/20 hover:border-partial transition-colors cursor-pointer"
        >
          🎯 Reveal a Letter
        </button>
      )}

      {/* Ad reward modal — reward callback triggers the actual letter reveal */}
      <AdRewardModal
        isOpen={adOpen}
        onClose={() => setAdOpen(false)}
        onRewarded={() => {
          revealLetter();
          // modal stays open briefly so the "Reward unlocked!" screen shows
        }}
      />
    </div>
  );
}
