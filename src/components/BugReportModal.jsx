import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export default function BugReportModal({ isOpen, onClose }) {
  const { mode } = useGame();
  const [description, setDescription] = useState('');

  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  useEffect(() => {
    if (!isOpen) return;
    window.modalOpen = true;
    // Focus textarea after modal renders
    const t = setTimeout(() => {
      document.querySelector('textarea')?.focus();
    }, 50);
    return () => {
      window.modalOpen = false;
      clearTimeout(t);
    };
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleClose = () => {
    setDescription('');
    setStatus('idle');
    onClose();
  };

  const handleSubmit = async () => {
    const trimmed = description.trim();
    if (!trimmed) return;

    setStatus('sending');
    try {
      const res = await fetch(`${API_BASE}/api/bug-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: trimmed,
          mode,
          userAgent: navigator.userAgent,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="bg-terminal-surface border border-terminal-border rounded-lg p-6 w-full max-w-md mx-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold font-mono text-terminal-text">
            🐛 Report a Bug
          </h2>
          <button
            onClick={handleClose}
            className="text-terminal-muted hover:text-terminal-text transition-colors text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {status === 'success' ? (
          /* ── Success state ── */
          <div className="text-center py-6 space-y-3">
            <div className="text-3xl">✅</div>
            <p className="text-terminal-text font-semibold">Thanks! We'll look into it.</p>
            <p className="text-terminal-muted text-xs">Your report has been sent.</p>
            <button
              onClick={handleClose}
              className="mt-4 px-6 py-2 bg-correct hover:bg-correct/90 text-white font-semibold rounded transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <div className="mb-4">
              <label className="block text-xs uppercase text-terminal-muted mb-2">
                Describe the issue
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="What went wrong? Steps to reproduce..."
                rows={4}
                maxLength={2000}
                className="w-full px-3 py-2 bg-terminal-bg border border-terminal-border text-terminal-text font-mono text-sm resize-none focus:outline-none focus:border-terminal-muted rounded"
              />
              <p className="text-terminal-muted text-[10px] mt-1 text-right">
                {description.length}/2000
              </p>
            </div>

            {/* Auto-filled device info */}
            <div className="mb-5">
              <p className="text-xs uppercase text-terminal-muted mb-1">Auto-filled info</p>
              <div className="bg-terminal-bg border border-terminal-border rounded px-3 py-2 space-y-0.5">
                <p className="text-[10px] font-mono text-terminal-muted">
                  <span className="text-terminal-text">Mode:</span> {mode}
                </p>
                <p className="text-[10px] font-mono text-terminal-muted break-all">
                  <span className="text-terminal-text">Agent:</span>{' '}
                  {navigator.userAgent.slice(0, 120)}
                  {navigator.userAgent.length > 120 ? '…' : ''}
                </p>
              </div>
            </div>

            {status === 'error' && (
              <p className="text-xs text-partial mb-3">
                Failed to send — please try again or email the dev directly.
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-terminal-border hover:bg-terminal-muted/30 text-terminal-text font-semibold rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!description.trim() || status === 'sending'}
                className="flex-1 px-4 py-2 bg-correct hover:bg-correct/90 text-white font-semibold rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'sending' ? 'Sending…' : 'Send Report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
