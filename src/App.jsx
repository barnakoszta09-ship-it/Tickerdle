import React, { useState, useRef, useEffect } from 'react';
import { GameProvider, useGame } from './context';
import Header from './components/Header.jsx';
import GameBoard from './components/GameBoard.jsx';
import Keyboard from './components/Keyboard.jsx';
import Modal from './components/Modal.jsx';
import HigherLowerGame from './components/HigherLowerGame.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import PlayerNameInput from './components/PlayerNameInput.jsx';
import HowToPlay from './components/HowToPlay.jsx';
import BackgroundChart from './components/BackgroundChart.jsx';

function AppContent() {
  const { mode, playerName, setPlayerName, showHowToPlay = true } = useGame();
  const [showNameInput, setShowNameInput] = useState(playerName === 'Anonymous');

  // Track which snap section is active by watching the container's scrollTop.
  // We use a scroll listener rather than IntersectionObserver because the HTP
  // section's top edge lands exactly at viewport-bottom on load, causing the
  // observer to fire immediately with isIntersecting=true at the boundary pixel.
  const snapRef = useRef(null);
  const [htpVisible, setHtpVisible] = useState(false);

  useEffect(() => {
    const el = snapRef.current;
    if (!el) return;
    const handler = () => {
      // Hide keyboard once user has scrolled more than 30 % of a section height.
      // scroll-snap will always land at 0 (game) or clientHeight (HTP), so this
      // midpoint fires reliably without false positives on load.
      setHtpVisible(el.scrollTop > el.clientHeight * 0.3);
    };
    // Listen to both 'scroll' (fires during animation) and 'scrollend' (fires
    // after snap settles). Desktop Chrome with scroll-snap can skip intermediate
    // scroll events and only fire once at the final position — 'scrollend'
    // guarantees we always read the settled scrollTop.
    el.addEventListener('scroll', handler, { passive: true });
    el.addEventListener('scrollend', handler, { passive: true });
    // Sync initial state (handles browser restoring scroll position)
    handler();
    return () => {
      el.removeEventListener('scroll', handler);
      el.removeEventListener('scrollend', handler);
    };
  }, []);

  const handleNameSubmit = (name) => {
    setPlayerName(name);
    setShowNameInput(false);
  };

  if (showNameInput) {
    return <PlayerNameInput onSubmit={handleNameSubmit} />;
  }

  const isGameMode = mode === 'daily' || mode === 'endless';

  return (
    <>
      {/* ── Scroll-snap container ──────────────────────────────────────── */}
      <div
        ref={snapRef}
        className="h-screen overflow-y-scroll"
        style={{ height: '100dvh', scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' }}
      >
        {/* Section 1: The Game */}
        <div
          className="h-screen flex flex-col overflow-hidden relative"
          style={{ height: '100dvh', scrollSnapAlign: 'start' }}
        >
          {/* Faint stock chart fills this section behind all content.
              z-index:-1 + no section background = visible against body's dark bg. */}
          <BackgroundChart />

          <Header />

          <main
            className="flex-1 min-h-0 flex flex-col items-center max-w-lg mx-auto w-full overflow-hidden"
            style={isGameMode ? { paddingBottom: 'var(--keyboard-height, 176px)' } : undefined}
          >
            {mode === 'leaderboard' ? (
              <div className="w-full h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <Leaderboard />
              </div>
            ) : mode === 'higher-lower' ? (
              <HigherLowerGame />
            ) : (
              <>
                <div className="flex-1 min-h-0 flex items-center justify-center w-full">
                  <GameBoard />
                </div>
                {/* Scroll-down nudge — clickable when HTP is enabled */}
                {showHowToPlay && (
                  <button
                    onClick={() => snapRef.current?.scrollTo({ top: snapRef.current.clientHeight, behavior: 'smooth' })}
                    className="flex flex-col items-center py-1 gap-0.5 text-terminal-muted/60 hover:text-terminal-muted/90 hover:brightness-125 transition-colors select-none"
                    aria-label="Scroll to How to Play"
                  >
                    <span className="text-[9px] font-mono tracking-widest uppercase">How to play</span>
                    <span className="text-[10px] animate-bounce">↓</span>
                  </button>
                )}
              </>
            )}
          </main>

          {mode !== 'higher-lower' && mode !== 'leaderboard' && <Modal />}
        </div>

        {/* Section 2: How to Play — hidden in H/L and leaderboard modes */}
        {showHowToPlay && isGameMode && (
          <HowToPlay onScrollUp={() => snapRef.current?.scrollTo({ top: 0, behavior: 'smooth' })} />
        )}
      </div>

      {/*
       * Keyboard lives outside the snap container so the ResizeObserver
       * always runs. hidden=true slides it below the viewport and blocks
       * all input while the How to Play section is showing.
       */}
      {isGameMode && <Keyboard hidden={htpVisible} />}
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
