import { useState, useEffect } from 'react';

/**
 * Returns true when window.innerHeight is below `threshold` px.
 * Re-evaluates on resize (handles orientation changes & address-bar toggling).
 */
export function useIsShortScreen(threshold = 700) {
  const [isShort, setIsShort] = useState(() => window.innerHeight < threshold);

  useEffect(() => {
    const update = () => setIsShort(window.innerHeight < threshold);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [threshold]);

  return isShort;
}
