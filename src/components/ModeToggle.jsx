import { useGame } from '../context/GameContext.jsx';

export default function ModeToggle() {
  const { mode, switchMode } = useGame();

  const btnClass = (m) =>
    `px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
      mode === m
        ? 'bg-terminal-border text-terminal-text'
        : 'text-terminal-muted hover:text-terminal-text'
    }`;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex bg-terminal-surface rounded-lg p-1 gap-1">
        <button onClick={() => switchMode('daily')} className={btnClass('daily')}>Daily</button>
        <button onClick={() => switchMode('endless')} className={btnClass('endless')}>Endless</button>
        <button onClick={() => switchMode('higher-lower')} className={btnClass('higher-lower')}>H/L</button>
      </div>
      <button
        onClick={() => switchMode('leaderboard')}
        className={`w-full text-center px-3 py-1 text-xs font-medium rounded-md transition-colors ${
          mode === 'leaderboard'
            ? 'bg-terminal-border text-terminal-text'
            : 'text-terminal-muted hover:text-terminal-text'
        }`}
      >
        Leaderboard
      </button>
    </div>
  );
}

