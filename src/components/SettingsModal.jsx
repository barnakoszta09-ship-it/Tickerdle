import { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function SettingsModal({ isOpen, onClose }) {
  const { playerName, setPlayerName, soundEnabled, setSoundEnabled, soundVolume, setSoundVolume } = useGame();
  const [nameInput, setNameInput] = useState(playerName);
  const [hasChanged, setHasChanged] = useState(false);

  const handleNameChange = (e) => {
    setNameInput(e.target.value);
    setHasChanged(true);
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setPlayerName(nameInput.trim());
      setHasChanged(false);
    }
  };

  const handleSoundToggle = () => {
    setSoundEnabled(!soundEnabled);
  };

  const handleVolumeChange = (e) => {
    setSoundVolume(parseFloat(e.target.value));
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-terminal-surface border border-terminal-border rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold font-mono text-terminal-text mb-6">Settings</h2>

        {/* Player Name Section */}
        <div className="mb-6 pb-6 border-b border-terminal-border">
          <label className="block text-xs uppercase text-terminal-muted mb-2">Player Name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={handleNameChange}
              className="flex-1 px-3 py-2 bg-terminal-surface border border-terminal-border text-terminal-text font-mono text-sm focus:outline-none focus:border-terminal-muted"
            />
            <button
              onClick={handleSaveName}
              disabled={!hasChanged || !nameInput.trim()}
              className="px-4 py-2 bg-correct hover:bg-correct/90 text-white font-semibold rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Sound Section */}
        <div className="mb-6 pb-6 border-b border-terminal-border">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-xs uppercase text-terminal-muted">Sound Effects</label>
            <button
              onClick={handleSoundToggle}
              className={`px-4 py-2 rounded font-semibold transition-colors ${
                soundEnabled
                  ? 'bg-correct text-white'
                  : 'bg-terminal-border text-terminal-muted'
              }`}
            >
              {soundEnabled ? 'On' : 'Off'}
            </button>
          </div>

          <div className={soundEnabled ? '' : 'opacity-40 pointer-events-none'}>
            <label className="block text-xs uppercase text-terminal-muted mb-2">Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={soundVolume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-terminal-border rounded appearance-none cursor-pointer"
            />
            <p className="text-xs text-terminal-muted mt-2">{Math.round(soundVolume * 100)}%</p>
          </div>
        </div>

        {/* Social Links Section - TODO: Add real links when community channels ready */}
        {/*
        <div className="mb-6">
          <p className="text-xs uppercase text-terminal-muted mb-3">Support & Follow</p>
          <div className="space-y-2">
            <a href="#" className="block px-4 py-2 bg-terminal-border hover:bg-terminal-muted/30 text-terminal-text text-center rounded transition-colors">Discord</a>
            <a href="#" className="block px-4 py-2 bg-terminal-border hover:bg-terminal-muted/30 text-terminal-text text-center rounded transition-colors">Patreon</a>
            <a href="#" className="block px-4 py-2 bg-terminal-border hover:bg-terminal-muted/30 text-terminal-text text-center rounded transition-colors">Buy Me a Coffee</a>
          </div>
        </div>
        */}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-terminal-border hover:bg-terminal-muted/30 text-terminal-text font-semibold rounded transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
