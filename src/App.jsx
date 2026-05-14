import React, { useState } from 'react';
import { GameProvider, useGame } from './context';
import Header from './components/Header.jsx';
import GameBoard from './components/GameBoard.jsx';
import Keyboard from './components/Keyboard.jsx';
import Modal from './components/Modal.jsx';
import HigherLowerGame from './components/HigherLowerGame.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import PlayerNameInput from './components/PlayerNameInput.jsx';

function AppContent() {
  const { mode, playerName, setPlayerName } = useGame();
  const [showNameInput, setShowNameInput] = useState(playerName === 'Anonymous');

  const handleNameSubmit = (name) => {
    setPlayerName(name);
    setShowNameInput(false);
  };

  if (showNameInput) {
    return <PlayerNameInput onSubmit={handleNameSubmit} />;
  }

  return (
    <div className="min-h-screen bg-terminal-bg flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-between max-w-lg mx-auto w-full">
        {mode === 'leaderboard' ? (
          <div className="w-full">
            <Leaderboard />
          </div>
        ) : mode === 'higher-lower' ? (
          <HigherLowerGame />
        ) : (
          <>
            <div className="flex-1 flex items-center">
              <GameBoard />
            </div>
            <Keyboard />
          </>
        )}
      </main>
      
      {mode !== 'higher-lower' && mode !== 'leaderboard' && <Modal />}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
