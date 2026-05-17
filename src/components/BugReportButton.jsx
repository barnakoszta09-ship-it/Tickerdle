import React from 'react';

export default function BugReportButton() {
  return (
    <button
      onClick={() => window.open('https://tickerdle.org/bugreport', '_blank')}
      aria-label="Report a bug"
      style={{
        position: 'fixed',
        bottom: 'calc(var(--keyboard-height, 0px) + 16px)',
        left: '16px',
        zIndex: 40,
      }}
      className={[
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
        'bg-terminal-surface border border-correct/50 text-correct/80',
        'text-xs font-semibold font-mono',
        'hover:border-correct hover:text-correct hover:bg-terminal-bg',
        'active:scale-95 transition-all duration-150',
        'select-none',
      ].join(' ')}
    >
      <span aria-hidden="true">🐛</span>
      Bug?
    </button>
  );
}
