import { useState, useEffect, useRef } from 'react';

const AD_DURATION = 15; // seconds

/**
 * Rewarded-ad gate for the "🎯 Reveal a Letter" hint.
 *
 * INTEGRATION POINT — replace simulateAd() with your real SDK call:
 *
 *   Google AdSense Rewarded (web):
 *     window.adBreak({ type: 'reward', name: 'reveal_letter',
 *       beforeReward: (showAdFn) => showAdFn(),
 *       adDismissed: onClose,
 *       adViewed: onRewarded });
 *
 *   Google AdMob (Capacitor / Android):
 *     import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';
 *     AdMob.addListener(RewardAdPluginEvents.Rewarded, onRewarded);
 *     await AdMob.showRewardVideoAd();
 *
 * Until a real SDK is wired in, a 15-second countdown simulates the experience.
 */
export default function AdRewardModal({ isOpen, onClose, onRewarded }) {
  const [phase, setPhase] = useState('prompt'); // 'prompt' | 'watching' | 'done'
  const [seconds, setSeconds] = useState(AD_DURATION);
  const rewardedRef = useRef(false);

  // Reset when modal re-opens
  useEffect(() => {
    if (isOpen) {
      setPhase('prompt');
      setSeconds(AD_DURATION);
      rewardedRef.current = false;
    }
  }, [isOpen]);

  // Countdown
  useEffect(() => {
    if (phase !== 'watching') return;
    if (seconds <= 0) {
      setPhase('done');
      if (!rewardedRef.current) {
        rewardedRef.current = true;
        onRewarded();
      }
      return;
    }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, seconds, onRewarded]);

  if (!isOpen) return null;

  const progress = ((AD_DURATION - seconds) / AD_DURATION) * 100;

  const handleBackdrop = (e) => {
    // Block closing while ad is playing
    if (phase === 'watching') return;
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
      onClick={handleBackdrop}
    >
      <div className="bg-terminal-surface border border-terminal-border rounded-xl w-full max-w-sm p-6 flex flex-col items-center gap-4">

        {/* ── Prompt ─────────────────────────────────────────────────────── */}
        {phase === 'prompt' && (
          <>
            <div className="text-4xl">🎯</div>
            <div className="text-center">
              <p className="text-base font-bold text-terminal-text mb-1">Reveal a Letter</p>
              <p className="text-sm text-terminal-muted">
                Watch a short ad to unlock a free letter hint for your final guess.
              </p>
            </div>
            <button
              onClick={() => setPhase('watching')}
              className="w-full py-3 bg-correct hover:bg-correct/90 text-white font-bold rounded-lg transition-colors text-sm"
            >
              ▶ Watch Ad
            </button>
            <button
              onClick={onClose}
              className="text-xs text-terminal-muted hover:text-terminal-text transition-colors"
            >
              No thanks
            </button>
          </>
        )}

        {/* ── Watching (simulated ad) ─────────────────────────────────────── */}
        {phase === 'watching' && (
          <>
            {/* Simulated ad placeholder — replace this block with your real ad container */}
            <div className="w-full aspect-video bg-terminal-bg border border-terminal-border rounded-lg flex flex-col items-center justify-center gap-2 text-terminal-muted">
              <span className="text-3xl">📺</span>
              <span className="text-xs uppercase tracking-widest">Ad playing…</span>
              {/* Your ad SDK will render its player here */}
            </div>

            {/* Progress bar */}
            <div className="w-full">
              <div className="w-full h-1.5 bg-terminal-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-correct transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-terminal-muted text-right mt-1">{seconds}s remaining</p>
            </div>
          </>
        )}

        {/* ── Done ────────────────────────────────────────────────────────── */}
        {phase === 'done' && (
          <>
            <div className="text-4xl">✅</div>
            <p className="text-base font-bold text-correct">Reward unlocked!</p>
            <p className="text-sm text-terminal-muted text-center">Your free letter hint is ready.</p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-correct hover:bg-correct/90 text-white font-bold rounded-lg transition-colors text-sm"
            >
              Reveal Letter
            </button>
          </>
        )}

      </div>
    </div>
  );
}
