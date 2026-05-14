import { useGame } from '../context/GameContext.jsx';

export default function ModeToggle() {
  const { mode, switchMode } = useGame();

  return (
    <div className="flex bg-terminal-surface rounded-lg p-1 gap-1 flex-wrap">
      <button
        onClick={() => switchMode('daily')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
          mode === 'daily'
            ? 'bg-terminal-border text-terminal-text'
            : 'text-terminal-muted hover:text-terminal-text'
        }`}
      >
        Daily
      </button>
      <button
        onClick={() => switchMode('endless')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
          mode === 'endless'
            ? 'bg-terminal-border text-terminal-text'
            : 'text-terminal-muted hover:text-terminal-text'
        }`}
      >
        Endless
      </button>
      <button
        onClick={() => switchMode('higher-lower')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
          mode === 'higher-lower'
            ? 'bg-terminal-border text-terminal-text'
            : 'text-terminal-muted hover:text-terminal-text'
        }`}
      >
        H/L
      </button>
      <button
        onClick={() => switchMode('leaderboard')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
          mode === 'leaderboard'
            ? 'bg-terminal-border text-terminal-text'
            : 'text-terminal-muted hover:text-terminal-text'
        }`}
      >
        Board
      </button>
    </div>
  );
}

