import { useMemo } from 'react';
import { useGame } from '../context/GameContext';
import HintPanel from './HintPanel';
import { MAXATTEMPTS } from '../utils/gameLogic';

/**
 * Hint area — sits between the game grid and the How-to-Play nudge.
 * Only renders in daily and endless modes (never in H/L or leaderboard).
 *
 * Behaviour:
 *  • "💡 Hint" button is always visible while the game is active.
 *    – Disabled (grayed) before guess 3.
 *    – Active from guess 3 onward.  First click upgrades the auto-hint panel
 *      to tier 2 (first letter only — length is already visible in the grid).
 *  • Auto-hint panel fades in automatically after the 3rd wrong guess.
 *  • "🎯 Reveal a Letter" appears only on the 6th (final) guess, while
 *    at least one position is still unresolved.
 */
export default function HintArea() {
  const {
    guesses, evaluations, won, gameOver, target, mode,
    hintUsed, useHint, revealedLetterPos, revealLetter,
  } = useGame();

  // Only show hints in wordle modes
  if (mode !== 'daily' && mode !== 'endless') return null;

  const autoHintVisible  = guesses.length >= 3 && !won;
  const hintBtnEnabled   = guesses.length >= 3 && !won && !gameOver && !hintUsed;
  const isOnLastGuess    = guesses.length === MAXATTEMPTS - 1;

  // Whether there is at least one position the player hasn't nailed yet
  const hasRevealablePositions = useMemo(() => {
    if (!target || !isOnLastGuess) return false;
    const correct = new Set();
    evaluations.forEach(row => row.forEach((e, i) => { if (e === 'correct') correct.add(i); }));
    return target.split('').some((_, i) => !correct.has(i));
  }, [target, evaluations, isOnLastGuess]);

  const showRevealBtn = isOnLastGuess && !won && !gameOver
    && revealedLetterPos === null
    && hasRevealablePositions;

  // Nothing to render? Still keep the 💡 button stub visible to prevent layout
  // shifts — but only while the game is still active.
  const showHintBtn = !won && !gameOver;

  if (!autoHintVisible && !showRevealBtn && !showHintBtn) return null;

  return (
    <div className="flex flex-col items-center gap-1.5 px-4 pb-2 w-full max-w-lg mx-auto">

      {/* ── Auto hint panel ─────────────────────────────────────────────── */}
      {autoHintVisible && <HintPanel showTier2={hintUsed} />}

      {/* ── Button row ──────────────────────────────────────────────────── */}
      {(showHintBtn || showRevealBtn) && (
        <div className="flex gap-2">

          {/* 💡 Hint — visible from turn 1, grayed until guess 3 */}
          {showHintBtn && (
            <button
              onClick={useHint}
              disabled={!hintBtnEnabled}
              className={`px-3 py-1 rounded-md text-xs font-semibold border transition-colors
                ${hintBtnEnabled
                  ? 'border-terminal-muted text-terminal-muted hover:border-terminal-text hover:text-terminal-text bg-terminal-bg cursor-pointer'
                  : 'border-terminal-border text-terminal-border bg-transparent cursor-not-allowed opacity-40'
                }`}
            >
              💡 Hint
            </button>
          )}

          {/* 🎯 Reveal a Letter — only on the 6th guess */}
          {showRevealBtn && (
            <button
              onClick={revealLetter}
              className="px-3 py-1 rounded-md text-xs font-semibold border border-partial/60 text-partial bg-partial/10 hover:bg-partial/20 hover:border-partial transition-colors cursor-pointer"
            >
              🎯 Reveal a Letter
            </button>
          )}

        </div>
      )}
    </div>
  );
}
