import { useState, useEffect } from 'react';
import { getLeaderboard } from '../utils/leaderboard';

export default function Leaderboard() {
  const [selectedMode, setSelectedMode] = useState('endless');
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    setEntries(getLeaderboard(selectedMode));
  }, [selectedMode]);

  const modeLabels = {
    daily: 'Daily',
    endless: 'Endless',
    'higher-lower': 'Higher or Lower',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-5xl font-bold text-terminal-text mb-8 text-center font-mono">
          LEADERBOARD
        </h1>

        {/* Mode Selector */}
        <div className="flex gap-2 mb-8 justify-center flex-wrap">
          {Object.entries(modeLabels).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`px-6 py-2 font-semibold rounded transition-colors ${
                selectedMode === mode
                  ? 'bg-terminal-border text-terminal-text'
                  : 'bg-terminal-bg border border-terminal-border text-terminal-muted hover:border-terminal-text'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <div className="bg-terminal-surface border border-terminal-border rounded-lg overflow-hidden">
          {entries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-terminal-border bg-terminal-bg">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-terminal-muted uppercase">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-terminal-muted uppercase">
                      Player
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-terminal-muted uppercase">
                      {selectedMode === 'daily' ? 'Score' : 'Streak'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-terminal-muted uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-terminal-border hover:bg-terminal-bg/50 transition-colors"
                    >
                      <td className="px-6 py-3 font-bold text-correct">
                        #{entry.rank}
                      </td>
                      <td className="px-6 py-3 text-terminal-text font-mono">
                        {entry.playerName}
                      </td>
                      <td className="px-6 py-3 text-right text-terminal-text font-bold">
                        {entry.score}
                      </td>
                      <td className="px-6 py-3 text-right text-terminal-muted text-sm">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-terminal-muted">No scores yet. Start playing to appear on the leaderboard!</p>
            </div>
          )}
        </div>

        <p className="text-center text-terminal-muted text-sm mt-8">
          Click on a game mode at the top to view different leaderboards
        </p>
      </div>
    </div>
  );
}
