import { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function SettingsModal({ isOpen, onClose }) {
  const {
    playerName, setPlayerName,
    soundEnabled, setSoundEnabled,
    soundVolume, setSoundVolume,
    chartStyle = 'line', setChartStyle,
    showHowToPlay = true, setShowHowToPlay,
  } = useGame();

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

  const handleSoundToggle = () => setSoundEnabled(!soundEnabled);
  const handleVolumeChange = (e) => setSoundVolume(parseFloat(e.target.value));

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        <div className="bg-terminal-surface border border-terminal-border rounded-lg p-6 w-full max-w-md mx-4">
          <h2 className="text-2xl font-bold font-mono text-terminal-text mb-6">Settings</h2>

          {/* ── Player Name ─────────────────────────────────────────────────── */}
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

          {/* ── Sound ───────────────────────────────────────────────────────── */}
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

          {/* ── Chart Style ─────────────────────────────────────────────────── */}
          <div className="mb-6 pb-6 border-b border-terminal-border">
            <label className="block text-xs uppercase text-terminal-muted mb-3">
              Background Chart
            </label>
            <div className="flex gap-1 p-1 bg-terminal-bg border border-terminal-border rounded-lg w-fit">
              {['line', 'candle'].map((style) => (
                <button
                  key={style}
                  onClick={() => setChartStyle(style)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold font-mono transition-colors capitalize ${
                    chartStyle === style
                      ? 'bg-correct text-white'
                      : 'text-terminal-muted hover:text-terminal-text'
                  }`}
                >
                  {style === 'line' ? '📈 Line' : '🕯 Candle'}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-terminal-muted mt-2">
              {chartStyle === 'line'
                ? 'Smooth price line with area fill.'
                : 'Weekly OHLC candles — green up, red down.'}
            </p>
          </div>

          {/* ── How to Play visibility ──────────────────────────────────────── */}
          <div className="mb-6 pb-6 border-b border-terminal-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-terminal-text">Show How to Play</p>
                <p className="text-[11px] text-terminal-muted mt-0.5">
                  Scroll hint and HTP section below the game
                </p>
              </div>
              <button
                onClick={() => setShowHowToPlay(!showHowToPlay)}
                className={`px-4 py-2 rounded font-semibold transition-colors ${
                  showHowToPlay
                    ? 'bg-correct text-white'
                    : 'bg-terminal-border text-terminal-muted'
                }`}
              >
                {showHowToPlay ? 'On' : 'Off'}
              </button>
            </div>
          </div>

          {/* ── About, Bug Report & Privacy ─────────────────────────────────── */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => window.open('/about.html', '_blank')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-terminal-border bg-terminal-bg hover:border-terminal-muted hover:bg-terminal-muted/10 text-terminal-text font-semibold text-sm transition-colors"
            >
              <span>ℹ️</span>
              About
            </button>
            <button
              onClick={() => window.open('/bugreport.html', '_blank')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-terminal-border bg-terminal-bg hover:border-partial hover:bg-partial/10 text-terminal-text hover:text-partial font-semibold text-sm transition-colors"
            >
              <span>🐛</span>
              Report a Bug
            </button>
          </div>
          <div className="mb-6">
            <button
              onClick={() => window.open('/privacy.html', '_blank')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-terminal-border bg-terminal-bg hover:border-terminal-muted hover:bg-terminal-muted/10 text-terminal-muted font-semibold text-sm transition-colors"
            >
              <span>🔒</span>
              Privacy Policy
            </button>
          </div>

          {/* ── Close ───────────────────────────────────────────────────────── */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-terminal-border hover:bg-terminal-muted/30 text-terminal-text font-semibold rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>

    </>
  );
}
