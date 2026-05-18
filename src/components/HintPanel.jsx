import { useGame } from '../context/GameContext';

/**
 * Auto-hint panel — fades in after the 3rd wrong guess.
 * Sector + market cap tier come from the server (hintMetadata in state)
 * so the answer ticker is never needed client-side.
 */
export default function HintPanel() {
  const { hintMetadata } = useGame();
  const sector       = hintMetadata?.sector        ?? '…';
  const marketCapTier = hintMetadata?.marketCapTier ?? '…';

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
