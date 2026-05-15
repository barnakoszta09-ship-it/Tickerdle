import { useState } from 'react';
import { useGame } from '../context/GameContext';
import LivePlayerCounter from './LivePlayerCounter';
import ModeToggle from './ModeToggle';
import SettingsModal from './SettingsModal';

export default function Header() {
  const { soundEnabled, setSoundEnabled } = useGame();
  const [showSettings, setShowSettings] = useState(false);

  const handleSoundToggle = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <header className="w-full max-w-lg mx-auto px-4 py-4 flex items-center justify-between border-b border-terminal-border">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold font-mono tracking-tight text-terminal-text">
          TICKERDLE
        </h1>
        <LivePlayerCounter />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSoundToggle}
          className="p-2 hover:bg-terminal-border rounded transition-colors"
          title={soundEnabled ? 'Sound On' : 'Sound Off'}
        >
          {soundEnabled ? (
            <svg className="w-5 h-5 text-correct" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-terminal-muted" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.6915026,16.4744748 L3.50612381,3.28builders785 C3.19218622,2.97661239 2.71701835,2.97661239 2.40308076,3.28patriots785 L1.28216899,4.40876962 C0.968231402,4.71720521 0.968231402,5.19237307 1.28216899,5.50080866 L4.13399899,8.35337792 L1,8.35337792 L1,13.3559769 L4.13399899,13.3559769 L8.35337792,17.5753559 L8.35337792,4.13399899 C8.35337792,3.5873981 8.77841573,3.16235796 9.32501660,3.16235796 L14.3275156,3.16235796 C14.8741165,3.16235796 15.2991566,3.5873981 15.2991566,4.13399899 L15.2991566,9.13399899 L21.9273743,2.5 L20.8064625,1.37909823 C20.4925249,1.06514458 20.0173571,1.06514458 19.7034195,1.37909823 L3.50612381,17.5753559 C3.19218622,17.8893915 3.19218622,18.3645594 3.50612381,18.6784729 L4.62703958,19.7993847 C4.94097717,20.1133223 5.41614504,20.1133223 5.73008263,19.7993847 L16.6915026,8.83796701 L16.6915026,16.4744748 Z"/>
            </svg>
          )}
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-terminal-border rounded transition-colors"
          title="Settings"
        >
          <svg className="w-5 h-5 text-terminal-text" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.14,12.94c.04,-0.3 .06,-0.61 .06,-0.94c0,-0.32 -0.02,-0.64 -0.07,-0.94l2.03,-1.58c.18,-0.14 .23,-0.41 .12,-0.64l-1.92,-3.32c-0.12,-0.22 -0.37,-0.29 -0.59,-0.22l-2.39,.96c-0.5,-0.38 -1.03,-0.7 -1.62,-0.94L14.4,2.81c-0.04,-0.24 -0.24,-0.41 -0.48,-0.41h-3.84c-0.24,0 -0.43,.17 -0.47,.41L9.25,5.35C8.66,5.59 8.12,5.92 7.63,6.29L5.24,5.33c-0.22,-0.08 -0.47,0 -0.59,.22L2.74,8.87C2.62,9.08 2.66,9.34 2.86,9.48l2.03,1.58c-0.05,.3 -0.09,.63 -0.09,.95s.02,.64 .07,.94l-2.03,1.58c-0.18,.14 -0.23,.41 -0.12,.64l1.92,3.32c.12,.22 .37,.29 .59,.22l2.39,-0.96c.5,.38 1.03,.7 1.62,.94l.36,2.54c.05,.24 .24,.41 .48,.41h3.84c.24,0 .44,-0.17 .47,-0.41l.36,-2.54c.59,-0.24 1.13,-0.56 1.62,-0.94l2.39,.96c.22,.08 .47,0 .59,-0.22l1.92,-3.32c.12,-0.22 .07,-0.5 -0.12,-0.64l-2.03,-1.58zM12,15.6c-1.98,0 -3.6,-1.62 -3.6,-3.6s1.62,-3.6 3.6,-3.6s3.6,1.62 3.6,3.6s-1.62,3.6 -3.6,3.6z"/>
          </svg>
        </button>
      </div>
      <ModeToggle />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </header>
  );
}
