import { useGame } from '../context/index.jsx';

export default function ModeToggle() {
  const { mode, switchMode } = useGame();

  return (
    <div className="flex bg-terminal-surface rounded-lg p-1 gap-1">
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
    </div>
  );
}
