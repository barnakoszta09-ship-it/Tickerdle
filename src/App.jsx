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
import HintArea from './components/HintArea.jsx';

const VALID_NAME_RE = /^[a-zA-Z0-9_]{2,16}$/;
function hasValidName(name) {
  return Boolean(name && name !== 'Anonymous' && VALID_NAME_RE.test(name.trim()));
}

function AppContent() {
  const { mode, playerName, setPlayerName, showHowToPlay = true } = useGame();
  const [showNameInput, setShowNameInput] = useState(!hasValidName(playerName));

  const snapRef = useRef(null);
  const htpRef = useRef(null);
  const [htpVisible, setHtpVisible] = useState(false);

  const isGameMode = mode === 'daily' || mode === 'endless';

  // Detect which snap section is active by watching the scroll position.
  // We use three complementary events so snap jumps are always caught:
  //   • scroll      — fires during smooth/momentum scrolling
  //   • scrollend   — fires once the snap settles (Chrome 114+, FF 109+)
  //   • pointerup   — catches finger-lift on touch devices where scroll may not fire
  // Rule: if scrollTop >= 40 % of the container height we're in the HTP section.
  useEffect(() => {
    const el = snapRef.current;
    if (!el) return;
    const check = () => setHtpVisible(el.scrollTop >= el.clientHeight * 0.4);
    check(); // run once on mount in case page loaded mid-scroll
    el.addEventListener('scroll',    check, { passive: true });
    el.addEventListener('scrollend', check, { passive: true });
    el.addEventListener('pointerup', check, { passive: true });
    return () => {
      el.removeEventListener('scroll',    check);
      el.removeEventListener('scrollend', check);
      el.removeEventListener('pointerup', check);
    };
  }, []);

  const handleNameSubmit = (name) => {
    setPlayerName(name);
    setShowNameInput(false);
  };

  if (showNameInput) {
    return <PlayerNameInput onSubmit={handleNameSubmit} />;
  }

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
            ) : mode === 'higher-lower' || mode === 'crypto' || mode === 'mixed-hl' ? (
              <HigherLowerGame />
            ) : (
              <>
                <div className="flex-1 min-h-0 flex items-center justify-center w-full">
                  <GameBoard />
                </div>
                {/* Progressive hint panel + buttons */}
                <HintArea />
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

          {mode !== 'higher-lower' && mode !== 'crypto' && mode !== 'mixed-hl' && mode !== 'leaderboard' && <Modal />}
        </div>

        {/* Section 2: How to Play — hidden in H/L and leaderboard modes */}
        {showHowToPlay && isGameMode && (
          <HowToPlay
            sectionRef={htpRef}
            onScrollUp={() => snapRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          />
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
