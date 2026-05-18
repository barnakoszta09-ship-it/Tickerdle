import { useState, useEffect, useRef, useCallback } from 'react';

const SIMULATION_DURATION = 15; // seconds — used only when no real ad is served
const AD_READY_TIMEOUT_MS = 3000; // wait this long for Google to serve an ad

/**
 * Rewarded-ad gate for the "🎯 Reveal a Letter" hint.
 *
 * Real-ad flow (Google AdSense H5 Games API):
 *   1. User clicks "Watch Ad"
 *   2. adBreak({ type: 'reward', ... }) is called
 *   3. Google's player overlays the page and plays the video
 *   4. adViewed()  → reward granted, modal shows success screen
 *   5. adDismissed() → no reward, modal returns to prompt
 *
 * Fallback (no ad served / ad blocked / not yet approved):
 *   Shows a 15-second simulated countdown so the UX still works during
 *   development and before AdSense approval.
 *
 * FINAL SETUP STEP: Replace ca-pub-XXXXXXXXXXXXXXXX in index.html with your
 * real AdSense publisher ID. That's the only change needed to go live.
 */
export default function AdRewardModal({ isOpen, onClose, onRewarded }) {
  const [phase, setPhase]       = useState('prompt');   // 'prompt'|'loading'|'watching'|'done'|'nodad'
  const [seconds, setSeconds]   = useState(SIMULATION_DURATION);
  const [isSimulation, setIsSimulation] = useState(false);
  const rewardedRef   = useRef(false);
  const fallbackTimer = useRef(null);

  // Reset every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setPhase('prompt');
      setSeconds(SIMULATION_DURATION);
      setIsSimulation(false);
      rewardedRef.current = false;
    }
    return () => clearTimeout(fallbackTimer.current);
  }, [isOpen]);

  const grantReward = useCallback(() => {
    if (!rewardedRef.current) {
      rewardedRef.current = true;
      onRewarded();
    }
    setPhase('done');
  }, [onRewarded]);

  // Simulation countdown (fallback path only)
  useEffect(() => {
    if (!isSimulation || phase !== 'watching') return;
    if (seconds <= 0) { grantReward(); return; }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [isSimulation, phase, seconds, grantReward]);

  const handleWatchAd = () => {
    setPhase('loading');

    // ── Real ad path ────────────────────────────────────────────────────────
    // adBreak is defined globally in index.html (H5 Games shim + AdSense SDK).
    // If Google serves an ad, beforeReward fires and the SDK overlays the page.
    // If no ad is available within AD_READY_TIMEOUT_MS we fall back.

    let adStarted = false;

    // Safety fallback — fires if Google never calls beforeReward
    fallbackTimer.current = setTimeout(() => {
      if (!adStarted) {
        console.info('[Tickerdle] No ad available — using simulation fallback');
        setIsSimulation(true);
        setSeconds(SIMULATION_DURATION);
        setPhase('watching');
      }
    }, AD_READY_TIMEOUT_MS);

    try {
      window.adBreak({
        type: 'reward',
        name: 'reveal_letter',

        // Called when a real ad is ready — show it immediately
        beforeReward: (showAdFn) => {
          adStarted = true;
          clearTimeout(fallbackTimer.current);
          setIsSimulation(false);
          setPhase('watching');
          showAdFn(); // Google's player takes over the screen
        },

        // User watched the full ad ✓
        adViewed: () => {
          grantReward();
        },

        // User closed the ad early — no reward
        adDismissed: () => {
          setPhase('prompt');
        },

        // Called after ad closes (viewed or dismissed)
        afterAd: () => {},
      });
    } catch (err) {
      // adBreak threw (e.g. AdSense not loaded at all) — go straight to fallback
      clearTimeout(fallbackTimer.current);
      console.warn('[Tickerdle] adBreak error, using simulation:', err);
      setIsSimulation(true);
      setSeconds(SIMULATION_DURATION);
      setPhase('watching');
    }
  };

  if (!isOpen) return null;

  const progress = ((SIMULATION_DURATION - seconds) / SIMULATION_DURATION) * 100;

  const handleBackdrop = (e) => {
    if (phase === 'watching' || phase === 'loading') return; // block dismiss while ad plays
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
              onClick={handleWatchAd}
              className="w-full py-3 bg-correct hover:bg-correct/90 text-white font-bold rounded-lg transition-colors text-sm"
            >
              ▶ Watch Ad
            </button>
            <button onClick={onClose} className="text-xs text-terminal-muted hover:text-terminal-text transition-colors">
              No thanks
            </button>
          </>
        )}

        {/* ── Loading (waiting for Google to serve an ad) ─────────────────── */}
        {phase === 'loading' && (
          <>
            <div className="text-4xl animate-pulse">📺</div>
            <p className="text-sm text-terminal-muted">Loading ad…</p>
          </>
        )}

        {/* ── Watching ────────────────────────────────────────────────────── */}
        {phase === 'watching' && (
          <>
            {isSimulation ? (
              // Simulation fallback — show countdown
              <>
                <div className="w-full aspect-video bg-terminal-bg border border-terminal-border rounded-lg flex flex-col items-center justify-center gap-2 text-terminal-muted">
                  <span className="text-3xl">📺</span>
                  <span className="text-xs uppercase tracking-widest">Ad playing…</span>
                </div>
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
            ) : (
              // Real ad — Google's player is on top; just show a brief note
              <>
                <div className="text-4xl animate-pulse">📺</div>
                <p className="text-sm text-terminal-muted text-center">
                  Your ad is playing…<br />
                  <span className="text-xs">Watch until the end to unlock your hint.</span>
                </p>
              </>
            )}
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
