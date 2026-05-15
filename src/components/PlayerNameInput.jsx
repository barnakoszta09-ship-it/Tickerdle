import { useState } from 'react';

export default function PlayerNameInput({ onSubmit }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-terminal-surface border-2 border-terminal-border rounded-lg p-8 w-96">
        <h2 className="text-2xl font-bold text-terminal-text mb-4">Enter Your Name</h2>
        <p className="text-terminal-muted mb-6">Choose a name for the leaderboard:</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Your name"
            autoFocus
            maxLength={20}
            className="w-full px-4 py-2 bg-terminal-bg border border-terminal-border rounded text-terminal-text placeholder-terminal-muted/50 mb-4 focus:outline-none focus:border-correct"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full px-4 py-2 bg-correct hover:bg-correct/90 disabled:bg-terminal-muted/30 text-white font-semibold rounded transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
