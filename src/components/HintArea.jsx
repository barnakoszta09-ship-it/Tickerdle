import { useState } from 'react';
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
    guesses, won, gameOver, mode,
    revealedLetterPos, revealLetter,
    hintsEnabled = true,
  } = useGame();
  const [adOpen, setAdOpen] = useState(false);

  const isGameMode      = mode === 'daily' || mode === 'endless';
  const autoHintVisible = isGameMode && hintsEnabled && guesses.length >= 3 && !won;
  const isOnLastGuess   = isGameMode && guesses.length === MAXATTEMPTS - 1;

  // Early returns — after all hooks
  if (!isGameMode) return null;
  if (!hintsEnabled) return null;

  // Server validates availability — if all positions are already correct
  // you'd have won, so this button is always valid when shown.
  const showRevealBtn = isOnLastGuess && !won && !gameOver && revealedLetterPos === null;

  if (!autoHintVisible && !showRevealBtn) return null;

  return (
    <div className="flex flex-col items-center gap-1.5 px-4 pb-2 w-full max-w-lg mx-auto">

      {/* ── Auto hint panel ─────────────────────────────────────────────── */}
      {autoHintVisible && <HintPanel />}

      {/* ── 🎯 Reveal a Letter — only on the 6th guess ──────────────────── */}
      {/* When ADS_ENABLED: opens the rewarded ad modal first             */}
      {/* When !ADS_ENABLED: reveals directly for free                    */}
      {showRevealBtn && (
        <button
          onClick={() => ADS_ENABLED ? setAdOpen(true) : revealLetter()}
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
