import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export default function BugReportModal({ isOpen, onClose }) {
  const { mode } = useGame();
  const [charCount, setCharCount] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const editableRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setCharCount(0);
    setStatus('idle');
    setTimeout(() => {
      if (editableRef.current) {
        editableRef.current.innerText = '';
        editableRef.current.focus();
      }
    }, 50);
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleClose = () => {
    setStatus('idle');
    setCharCount(0);
    if (editableRef.current) editableRef.current.innerText = '';
    onClose();
  };

  const handleInput = () => {
    const text = editableRef.current?.innerText ?? '';
    if (text.length > 2000) {
      editableRef.current.innerText = text.slice(0, 2000);
      // Move cursor to end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editableRef.current);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    setCharCount(Math.min(editableRef.current?.innerText.length ?? 0, 2000));
  };

  const handleSubmit = async () => {
    const trimmed = (editableRef.current?.innerText ?? '').trim();
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
          <>
            <div className="mb-4">
              <label className="block text-xs uppercase text-terminal-muted mb-2">
                Describe the issue
              </label>
              <div
                ref={editableRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                data-placeholder="What went wrong? Steps to reproduce..."
                className="w-full px-3 py-2 bg-terminal-bg border border-terminal-border text-terminal-text font-mono text-sm focus:outline-none focus:border-terminal-muted rounded min-h-[96px] empty:before:content-[attr(data-placeholder)] empty:before:text-terminal-muted"
              />
              <p className="text-terminal-muted text-[10px] mt-1 text-right">
                {charCount}/2000
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
                disabled={charCount === 0 || status === 'sending'}
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
