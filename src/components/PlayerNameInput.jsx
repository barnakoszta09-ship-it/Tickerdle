import { useState } from 'react';

const NAME_RE = /^[a-zA-Z0-9_]{2,16}$/;

function validate(raw) {
  const name = raw.trim();
  if (!name) return 'Name is required';
  if (name.length < 2) return 'At least 2 characters required';
  if (!NAME_RE.test(name)) return 'Letters, numbers, and underscores only (max 16)';
  return null;
}

export default function PlayerNameInput({ onSubmit }) {
  const [name, setName]           = useState('');
  const [error, setError]         = useState(null);
  const [touched, setTouched]     = useState(false);
  const [termsAccepted, setTerms] = useState(false);

  const handleChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (touched) setError(validate(val));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    const err = validate(name);
    if (err) { setError(err); return; }
    if (!termsAccepted) return;
    localStorage.setItem('tickerdle_termsAccepted', 'true');
    onSubmit(name.trim());
  };

  const canPlay = termsAccepted;

  return (
    <div className="fixed inset-0 bg-terminal-bg flex items-center justify-center z-50 p-4">
      <div className="bg-terminal-surface border border-terminal-border rounded-xl p-8 w-full max-w-sm text-center">
        <div className="text-4xl mb-3">📈</div>
        <h1 className="text-2xl font-bold font-mono text-terminal-text tracking-widest mb-1">
          TICKERDLE
        </h1>
        <p className="text-terminal-muted text-sm mb-8">
          Welcome — enter your name to play
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <input
            type="text"
            value={name}
            onChange={handleChange}
            placeholder="YourName"
            autoFocus
            maxLength={16}
            autoComplete="off"
            spellCheck={false}
            className="w-full px-4 py-3 bg-terminal-bg border border-terminal-border rounded-lg text-terminal-text font-mono text-center placeholder-terminal-muted/40 focus:outline-none focus:border-correct transition-colors"
          />

          <div className="h-6 flex items-center justify-center mt-1 mb-4">
            {touched && error ? (
              <p className="text-partial text-xs">{error}</p>
            ) : (
              <p className="text-terminal-muted/50 text-xs">
                2–16 chars · letters, numbers, underscores
              </p>
            )}
          </div>

          {/* ── Terms checkbox ─────────────────────────────────── */}
          <label className="flex items-start gap-3 mb-5 cursor-pointer text-left group">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-correct cursor-pointer"
            />
            <span className="text-xs text-terminal-muted leading-relaxed group-hover:text-terminal-text transition-colors">
              I agree to the{' '}
              <a
                href="/terms.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-correct underline hover:text-correct/80"
                onClick={(e) => e.stopPropagation()}
              >
                Terms of Service
              </a>
              {' '}and{' '}
              <a
                href="/privacy.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-correct underline hover:text-correct/80"
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </a>
            </span>
          </label>

          <button
            type="submit"
            disabled={!canPlay}
            className={`w-full py-3 font-bold font-mono rounded-lg transition-colors ${
              canPlay
                ? 'bg-correct hover:bg-correct/90 text-white cursor-pointer'
                : 'bg-terminal-border text-terminal-muted cursor-not-allowed opacity-50'
            }`}
          >
            Play
          </button>
        </form>
      </div>
    </div>
  );
}
