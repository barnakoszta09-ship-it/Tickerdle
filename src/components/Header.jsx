import { useState } from 'react';
import LivePlayerCounter from './LivePlayerCounter';
import ModeToggle from './ModeToggle';
import SettingsModal from './SettingsModal';

export default function Header() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className="w-full max-w-lg mx-auto px-4 py-4 flex items-center justify-between border-b border-terminal-border">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold font-mono tracking-tight text-terminal-text">
          TICKERDLE
        </h1>
        <LivePlayerCounter />
      </div>
      <ModeToggle />
      <button
        onClick={() => setShowSettings(true)}
        className="p-2 hover:bg-terminal-border rounded transition-colors"
        title="Settings"
      >
        <svg className="w-5 h-5 text-terminal-text" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.14,12.94c.04,-0.3 .06,-0.61 .06,-0.94c0,-0.32 -0.02,-0.64 -0.07,-0.94l2.03,-1.58c.18,-0.14 .23,-0.41 .12,-0.64l-1.92,-3.32c-0.12,-0.22 -0.37,-0.29 -0.59,-0.22l-2.39,.96c-0.5,-0.38 -1.03,-0.7 -1.62,-0.94L14.4,2.81c-0.04,-0.24 -0.24,-0.41 -0.48,-0.41h-3.84c-0.24,0 -0.43,.17 -0.47,.41L9.25,5.35C8.66,5.59 8.12,5.92 7.63,6.29L5.24,5.33c-0.22,-0.08 -0.47,0 -0.59,.22L2.74,8.87C2.62,9.08 2.66,9.34 2.86,9.48l2.03,1.58c-0.05,.3 -0.09,.63 -0.09,.95s.02,.64 .07,.94l-2.03,1.58c-0.18,.14 -0.23,.41 -0.12,.64l1.92,3.32c.12,.22 .37,.29 .59,.22l2.39,-0.96c.5,.38 1.03,.7 1.62,.94l.36,2.54c.05,.24 .24,.41 .48,.41h3.84c.24,0 .44,-0.17 .47,-0.41l.36,-2.54c.59,-0.24 1.13,-0.56 1.62,-0.94l2.39,.96c.22,.08 .47,0 .59,-0.22l1.92,-3.32c.12,-0.22 .07,-0.5 -0.12,-0.64l-2.03,-1.58zM12,15.6c-1.98,0 -3.6,-1.62 -3.6,-3.6s1.62,-3.6 3.6,-3.6s3.6,1.62 3.6,3.6s-1.62,3.6 -3.6,3.6z"/>
        </svg>
      </button>
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </header>
  );
}
