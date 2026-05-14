import { GameProvider, useGame } from '../context/index.jsx';
import Header from './Header';
import GameBoard from './GameBoard';
import Keyboard from './Keyboard';
import Modal from './Modal';

export default function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-terminal-bg flex flex-col">
        <Header />
        
        <main className="flex-1 flex flex-col items-center justify-between max-w-lg mx-auto w-full">
          <div className="flex-1 flex items-center">
            <GameBoard />
          </div>
          <Keyboard />
        </main>
        
        <Modal />
      </div>
    </GameProvider>
  );
}
