
// ── Tile used only for static examples — no game logic, no animation ────────
function ExTile({ letter, state = 'empty' }) {
  const styles = {
    correct: 'border-correct bg-correct text-white',
    partial: 'border-partial bg-partial text-white',
    wrong:   'border-terminal-border text-terminal-text',
    empty:   'border-terminal-border text-transparent',
  };
  return (
    <div className={`w-9 h-9 flex items-center justify-center border-2 rounded-md font-mono font-bold text-base ${styles[state]}`}>
      {letter}
    </div>
  );
}

function ExRow({ tiles, colorWord, colorClass, label }) {
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
        {tiles.map((t, i) => <ExTile key={i} {...t} />)}
      </div>
      <p className="text-terminal-muted text-xs leading-snug">
        <span className={`font-bold font-mono ${colorClass}`}>{colorWord}</span>{' '}{label}
      </p>
    </div>
  );
}

function CoffeeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
      <path d="M20 3H4v10a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-1h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 6h-2V5h2v4zM2 19h16v2H2v-2z"/>
    </svg>
  );
}

export default function HowToPlay({ onScrollUp, sectionRef }) {
  return (
    <section ref={sectionRef} className="snap-start min-h-screen w-full bg-terminal-bg border-t border-terminal-border flex flex-col items-center justify-start px-6 pt-8 pb-10">
      <div className="max-w-lg w-full space-y-4">

        {/* Title */}
        <div className="text-center space-y-0.5">
          <button
            onClick={onScrollUp}
            className="text-terminal-muted/60 hover:text-terminal-muted/90 hover:brightness-125 transition-colors text-[10px] font-mono tracking-widest uppercase"
            aria-label="Scroll back up to game"
          >
            ↑ scroll up to play
          </button>
          <h2 className="text-xl font-bold font-mono tracking-widest text-terminal-text">HOW TO PLAY</h2>
        </div>

        {/* S&P 500 scope badge */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-wide text-terminal-muted">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-correct opacity-70" />
          All tickers are&nbsp;<span className="text-terminal-text font-semibold">S&amp;P 500</span>&nbsp;companies
        </div>

        {/* Rules */}
        <ul className="space-y-1.5 text-terminal-muted text-xs">
          <li className="flex gap-2">
            <span className="text-terminal-text shrink-0">1.</span>
            Guess the <span className="text-terminal-text font-semibold mx-1">stock ticker</span> in 6 tries.
          </li>
          <li className="flex gap-2">
            <span className="text-terminal-text shrink-0">2.</span>
            Each guess must be a <span className="text-terminal-text font-semibold mx-1">valid ticker symbol</span>.
          </li>
          <li className="flex gap-2">
            <span className="text-terminal-text shrink-0">3.</span>
            After each guess, tiles flip to reveal how close you were.
          </li>
        </ul>

        {/* Buy Me a Coffee — placed above examples so it's always on-screen */}
        <div className="border-t border-terminal-border pt-4 flex flex-col items-center gap-2">
          <p className="text-terminal-muted text-xs">Enjoying Tickerdle? Support the dev!</p>
          <a
            href="https://buymeacoffee.com/GamesByBarni"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm transition-opacity hover:opacity-85 active:opacity-70"
            style={{ backgroundColor: '#FFDD00', color: '#000000' }}
          >
            <CoffeeIcon />
            Buy me a coffee
          </a>
        </div>

        {/* Examples */}
        <div className="border-t border-terminal-border pt-3 space-y-3">
          <p className="text-terminal-muted text-[10px] font-mono tracking-widest uppercase">Examples</p>

          <ExRow
            tiles={[
              { letter: 'N', state: 'correct' },
              { letter: 'F', state: 'empty' },
              { letter: 'L', state: 'empty' },
              { letter: 'X', state: 'empty' },
            ]}
            colorWord="N" colorClass="text-correct"
            label="is in the correct spot."
          />

          <ExRow
            tiles={[
              { letter: 'A', state: 'empty' },
              { letter: 'M', state: 'empty' },
              { letter: 'Z', state: 'empty' },
              { letter: 'N', state: 'partial' },
            ]}
            colorWord="N" colorClass="text-partial"
            label="is in the ticker but in the wrong spot."
          />

          <ExRow
            tiles={[
              { letter: 'P', state: 'wrong' },
              { letter: 'L', state: 'empty' },
              { letter: 'U', state: 'empty' },
              { letter: 'G', state: 'empty' },
            ]}
            colorWord="P" colorClass="text-terminal-muted"
            label="is not in the ticker at all."
          />
        </div>

        {/* Hints */}
        <div className="border-t border-terminal-border pt-3 space-y-3">
          <p className="text-terminal-muted text-[10px] font-mono tracking-widest uppercase">Hints</p>

          <div className="flex gap-3 items-start">
            <span className="text-sm mt-0.5">💡</span>
            <p className="text-xs text-terminal-muted leading-relaxed">
              After your <span className="text-terminal-text font-semibold">3rd wrong guess</span>, a panel appears showing the ticker&apos;s <span className="text-terminal-text font-semibold">sector</span> and <span className="text-terminal-text font-semibold">market cap tier</span>.
            </p>
          </div>

          <div className="flex gap-3 items-start">
            <span className="text-sm mt-0.5">🎯</span>
            <p className="text-xs text-terminal-muted leading-relaxed">
              On your <span className="text-terminal-text font-semibold">final guess</span>, tap <span className="text-terminal-text font-semibold">Reveal a Letter</span> to lock one correct letter as a <span className="text-correct font-semibold">green tile</span>.
            </p>
          </div>

          <p className="text-terminal-muted text-[10px] opacity-60">Daily and Endless modes only.</p>
        </div>

        {/* Tips */}
        <div className="border-t border-terminal-border pt-3 space-y-1 text-terminal-muted text-xs">
          <p>A new daily ticker drops every <span className="text-terminal-text">midnight</span>.</p>
          <p>Try <span className="text-terminal-text">Endless</span> or <span className="text-terminal-text">H/L</span> mode for more.</p>
        </div>

      </div>
    </section>
  );
}
