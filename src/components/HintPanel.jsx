import { useGame } from '../context/GameContext';
import { getTickerHints } from '../utils/tickerMetadata';

/**
 * Displays tier-1 hints (sector + market-cap tier) automatically after the
 * 3rd wrong guess.  When showTier2 is true (player clicked the Hint button)
 * it also reveals the ticker length and first letter.
 */
export default function HintPanel({ showTier2 = false }) {
  const { target } = useGame();
  const { sector, marketCapTier } = getTickerHints(target);

  return (
    <div className="hint-fade-in flex items-start gap-2 w-full px-3 py-2 bg-terminal-surface border border-terminal-border rounded-lg text-xs">
      <span className="mt-px select-none">💡</span>
      <div className="flex flex-col gap-1 min-w-0">
        {/* Tier 1 — always shown when panel is visible */}
        <div className="flex flex-wrap gap-x-4 gap-y-0.5">
          <span className="text-terminal-muted">
            Sector:{' '}
            <span className="text-terminal-text font-semibold">{sector}</span>
          </span>
          <span className="text-terminal-muted">
            Market Cap:{' '}
            <span className="text-terminal-text font-semibold">{marketCapTier}</span>
          </span>
        </div>

        {/* Tier 2 — shown after the player clicks "💡 Hint" */}
        {showTier2 && (
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 hint-fade-in">
            <span className="text-terminal-muted">
              Length:{' '}
              <span className="text-correct font-semibold font-mono">{target.length}</span>
            </span>
            <span className="text-terminal-muted">
              First letter:{' '}
              <span className="text-correct font-semibold font-mono">{target[0]}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
