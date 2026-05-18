import { useGame } from '../context/GameContext';
import { getTickerHints } from '../utils/tickerMetadata';

/**
 * Auto-hint panel — fades in after the 3rd wrong guess.
 * Shows sector and market-cap tier only. No manual tier-2; the first letter
 * is reserved for the 🎯 Reveal system on the final guess.
 */
export default function HintPanel() {
  const { target } = useGame();
  const { sector, marketCapTier } = getTickerHints(target);

  return (
    <div className="hint-fade-in w-full flex items-center gap-2.5 px-3 py-2 bg-terminal-surface border border-terminal-muted/40 rounded-lg">
      <span className="text-sm select-none shrink-0">💡</span>
      <div className="flex flex-wrap gap-x-5 gap-y-0.5 text-sm">
        <span>
          <span className="text-terminal-muted">Sector: </span>
          <span className="font-semibold text-terminal-text">{sector}</span>
        </span>
        <span>
          <span className="text-terminal-muted">Market Cap: </span>
          <span className="font-semibold text-terminal-text">{marketCapTier}</span>
        </span>
      </div>
    </div>
  );
}
