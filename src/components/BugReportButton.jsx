/**
 * BugReportButton — fixed pill in the bottom-left corner.
 * Sits above the on-screen keyboard on mobile by reading --keyboard-height.
 * Visible on both the game screen and the How-to-Play section.
 */
import { useState } from 'react';
import BugReportModal from './BugReportModal';

export default function BugReportButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Report a bug"
        style={{
          position: 'fixed',
          bottom: 'calc(var(--keyboard-height, 0px) + 16px)',
          left: '16px',
          zIndex: 40,
        }}
        className={[
          // Pill shape
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
          // Colours — dark surface, green border, subtle green text
          'bg-terminal-surface border border-correct/50 text-correct/80',
          // Typography
          'text-xs font-semibold font-mono',
          // Interaction
          'hover:border-correct hover:text-correct hover:bg-terminal-bg',
          'active:scale-95 transition-all duration-150',
          // Keeps it from capturing game keyboard events
          'select-none',
        ].join(' ')}
      >
        <span aria-hidden="true">🐛</span>
        Bug?
      </button>

      <BugReportModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
