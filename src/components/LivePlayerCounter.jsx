import { useEffect, useState } from 'react';

function formatCount(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return `${value}`;
}

function getStartingCount() {
  const base = 1200;
  const minuteSeed = Math.floor(Date.now() / 1000 / 30) % 100;
  return base + minuteSeed + Math.floor(Math.random() * 80);
}

export default function LivePlayerCounter() {
  const [count, setCount] = useState(getStartingCount);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((previous) => {
        const change = Math.floor(Math.random() * 11) - 5;
        const next = Math.max(400, previous + change);
        return next;
      });
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-full border border-terminal-border bg-terminal-surface px-3 py-1 text-xs uppercase tracking-[0.18em] text-terminal-muted">
      {formatCount(count)} online (simulated)
    </div>
  );
}
