import ModeToggle from './ModeToggle';

export default function Header() {
  return (
    <header className="w-full max-w-lg mx-auto px-4 py-4 flex items-center justify-between border-b border-terminal-border">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold font-mono tracking-tight text-terminal-text">
          TICKERDLE
        </h1>
      </div>
      <ModeToggle />
    </header>
  );
}
