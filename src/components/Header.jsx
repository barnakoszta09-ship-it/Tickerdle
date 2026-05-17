import { useState } from 'react';
import LivePlayerCounter from './LivePlayerCounter';
import ModeToggle from './ModeToggle';
import SettingsModal from './SettingsModal';
import { useIsShortScreen } from '../hooks/useIsShortScreen';

/**
 * Inline candlestick that visually replaces the "I" in TICKERDLE.
 *
 * Sizing rationale (all em-relative so it scales with font-size):
 *   width  0.60em  ≈ advance width of a JetBrains Mono capital
 *   height 0.72em  ≈ cap-height of JetBrains Mono Bold (top sits flush with
 *                    other capitals when verticalAlign is 'baseline')
 *   marginRight 0.1em  mirrors tracking-widest (letter-spacing: 0.1em) so
 *                      the gap before "C" matches every other inter-letter gap
 */
function CandleI() {
  // viewBox 0 0 10 16 — 10-unit wide, 16-unit tall coordinate space
  //   Wick  : centre line x=5, full height (y 0.5 → 15.5)
  //   Body  : x=1.5, y=3, w=7 (70 % wide), h=10 (62.5 % tall)
  //   Gaps  : upper wick = 3/16 ≈ 19 %, lower wick = 3/16 ≈ 19 %
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 10 16"
      style={{
        display: 'inline-block',
        width: '0.60em',
        height: '0.72em',
        verticalAlign: 'baseline',
        marginRight: '0.10em',
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Wick — thin line running the full height */}
      <line
        x1="5" y1="0.5" x2="5" y2="15.5"
        stroke="#22c55e"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Body — solid green rectangle */}
      <rect x="1.5" y="3" width="7" height="10" rx="1" fill="#22c55e" />
    </svg>
  );
}

export default function Header() {
  const [showSettings, setShowSettings] = useState(false);
  // Compact layout when viewport height < 760 px.
  // This covers iPhone SE (667), Galaxy S8+ (740), and any similar device
  // where the full header + 64 px tiles would otherwise overflow the grid.
  const compact = useIsShortScreen(760);

  return (
    <header
      className={`
        w-full max-w-lg mx-auto px-4 border-b border-terminal-border relative flex-shrink-0
        ${compact ? 'pt-2 pb-2' : 'pt-5 pb-3'}
      `}
    >
      {/* Title row — centered */}
      <div className={`flex flex-col items-center gap-1 ${compact ? 'mb-1.5' : 'mb-3'}`}>
        {/*
         * aria-label preserves the full word for screen readers — the SVG
         * inside is aria-hidden so assistive tech reads "TICKERDLE" cleanly.
         */}
        <h1
          aria-label="TICKERDLE"
          className={`
            font-bold font-mono tracking-widest text-terminal-text
            ${compact ? 'text-xl' : 'text-2xl'}
          `}
        >
          {/* "I" replaced by an inline candlestick SVG */}
          <span aria-hidden="true">T</span>
          <CandleI />
          <span aria-hidden="true">CKERDLE</span>
        </h1>
        {/* Hide player counter on short screens to reclaim ~32 px */}
        {!compact && <LivePlayerCounter />}
      </div>

      {/* Mode tabs — centered */}
      <div className="flex justify-center">
        <ModeToggle />
      </div>

      {/* Buy Me a Coffee — absolute top-left, mirrors the gear on the right */}
      <a
        href="https://buymeacoffee.com/GamesByBarni"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 left-4 p-1.5 rounded transition-opacity hover:opacity-80"
        style={{ backgroundColor: '#FFDD00' }}
        title="Buy me a coffee"
        aria-label="Buy me a coffee"
      >
        <svg viewBox="0 0 24 24" fill="#000000" className="w-4 h-4" aria-hidden="true">
          <path d="M20 3H4v10a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-1h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 6h-2V5h2v4zM2 19h16v2H2v-2z"/>
        </svg>
      </a>

      {/* Settings gear — absolute top-right */}
      <button
        onClick={() => setShowSettings(true)}
        className="absolute top-3 right-4 p-2 hover:bg-terminal-border rounded transition-colors"
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
