import { useGame } from '../context/GameContext.jsx';

const HL_MODES = ['higher-lower', 'crypto', 'mixed-hl'];

export default function ModeToggle() {
  const { mode, switchMode } = useGame();

  const isHLActive = HL_MODES.includes(mode);

  const btnClass = (m) =>
    `px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
      mode === m
        ? 'bg-terminal-border text-terminal-text'
        : 'text-terminal-muted hover:text-terminal-text'
    }`;

  const hlMainClass = `px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
    isHLActive
      ? 'bg-terminal-border text-terminal-text'
      : 'text-terminal-muted hover:text-terminal-text'
  }`;

  const handleHLClick = () => {
    if (!isHLActive) switchMode('higher-lower');
    // already in an HL mode — clicking the parent does nothing (sub-row stays visible)
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {/* ── Main row ──────────────────────────────────────────────── */}
      <div className="flex bg-terminal-surface rounded-lg p-1 gap-1">
        <button onClick={() => switchMode('daily')}       className={btnClass('daily')}>Daily</button>
        <button onClick={() => switchMode('endless')}     className={btnClass('endless')}>Endless</button>
        <button onClick={handleHLClick}                   className={hlMainClass}>H/L</button>
        <button onClick={() => switchMode('leaderboard')} className={btnClass('leaderboard')}>Leaderboard</button>
      </div>

      {/* ── H/L sub-row — only visible when an H/L mode is active ── */}
      {isHLActive && (
        <div className="flex bg-terminal-surface rounded-lg p-1 gap-1">
          <button onClick={() => switchMode('higher-lower')} className={btnClass('higher-lower')}>📈 Stocks</button>
          <button onClick={() => switchMode('crypto')}       className={btnClass('crypto')}>₿ Crypto</button>
          <button onClick={() => switchMode('mixed-hl')}     className={btnClass('mixed-hl')}>🔀 Mixed</button>
        </div>
      )}
    </div>
  );
}
