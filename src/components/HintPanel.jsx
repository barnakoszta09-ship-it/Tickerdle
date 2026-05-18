import { useGame } from '../context/GameContext';
import { getTickerHints } from '../utils/tickerMetadata';

/**
 * Displays tier-1 hints (sector + market-cap tier) automatically after the
 * 3rd wrong guess.  When showTier2 is true (player clicked the Hint button)
 * it also reveals the first letter.
 */
export default function HintPanel({ showTier2 = false }) {
  const { target } = useGame();
  const { sector, marketCapTier } = getTickerHints(target);

  return (
    <div className="hint-fade-in w-full rounded-lg border border-terminal-muted/50 bg-terminal-surface overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-terminal-muted/10 border-b border-terminal-muted/20">
        <span className="text-sm select-none">💡</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-terminal-muted">Hint</span>
      </div>

      {/* Content */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 px-3 py-2.5">
        {/* Tier 1 */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-terminal-muted">Sector</span>
          <span className="text-sm font-bold text-terminal-text font-mono">{sector}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-terminal-muted">Market Cap</span>
          <span className="text-sm font-bold text-terminal-text font-mono">{marketCapTier}</span>
        </div>

        {/* Tier 2 — first letter only (length is already visible in the grid) */}
        {showTier2 && (
          <div className="flex flex-col gap-0.5 hint-fade-in">
            <span className="text-[10px] uppercase tracking-wider text-terminal-muted">First Letter</span>
            <span className="text-sm font-bold text-correct font-mono">{target[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
}
