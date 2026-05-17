/**
 * LivePlayerCounter — real-time online count via WebSocket.
 *
 * Connection URL resolution:
 *   Production  (VITE_API_URL is empty) → wss://tickerdle.org/ws  (same origin)
 *   Local dev   (VITE_API_URL=http://localhost:3001) → ws://localhost:3001/ws
 *
 * Lifecycle:
 *   • Connects on mount, sends a heartbeat ping every 60 s so the server
 *     knows the tab is still active (idle threshold: 5 min server-side).
 *   • Reconnects with exponential backoff (1 s → 2 s → 4 s … capped at 30 s)
 *     if the connection drops.
 *   • Closes cleanly on beforeunload so the server count updates immediately.
 *   • Shows nothing while count is null (not yet connected) or ≤ 1.
 */
import { useEffect, useRef, useState } from 'react';

// Derive WebSocket URL from the Vite env var (same logic as BackgroundChart /
// BugReportModal use for the HTTP base URL).
const API_BASE = import.meta.env.VITE_API_URL ?? '';
const WS_URL   = API_BASE
  ? API_BASE.replace(/^http/, 'ws') + '/ws'
  : `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`;

const HEARTBEAT_MS = 60_000;  // ping server every 60 s
const MAX_RETRY_MS = 30_000;  // cap reconnect backoff at 30 s

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${n}`;
}

export default function LivePlayerCounter() {
  const [count, setCount] = useState(null); // null = not yet received first update

  const wsRef     = useRef(null);
  const retryRef  = useRef(1000);   // current backoff delay (ms)
  const timerRef  = useRef(null);   // reconnect timeout handle
  const beatRef   = useRef(null);   // heartbeat interval handle

  useEffect(() => {
    let destroyed = false;

    function connect() {
      if (destroyed) return;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        retryRef.current = 1000; // reset backoff on successful connection
        // Send a heartbeat ping every 60 s to keep the server session alive
        beatRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, HEARTBEAT_MS);
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (typeof data.count === 'number') setCount(data.count);
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        clearInterval(beatRef.current);
        if (!destroyed) {
          // Exponential backoff reconnect
          timerRef.current = setTimeout(() => {
            retryRef.current = Math.min(retryRef.current * 2, MAX_RETRY_MS);
            connect();
          }, retryRef.current);
        }
      };

      // onerror fires before onclose — just close so the reconnect path runs
      ws.onerror = () => ws.close();
    }

    connect();

    // Tell the server we're leaving so it can drop us immediately
    const handleUnload = () => wsRef.current?.close();
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      destroyed = true;
      clearInterval(beatRef.current);
      clearTimeout(timerRef.current);
      window.removeEventListener('beforeunload', handleUnload);
      wsRef.current?.close();
    };
  }, []);

  // Not connected yet — render nothing (avoids a flash of 0)
  if (count === null) return null;

  // Solo player — no point showing "1 ONLINE"
  if (count <= 1) return null;

  return (
    <div className="rounded-full border border-terminal-border bg-terminal-surface px-3 py-1 text-xs uppercase tracking-[0.18em] text-terminal-muted">
      {formatCount(count)} online
    </div>
  );
}
