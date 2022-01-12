import { useRef } from 'react';

export const useThrottledCall = (call: () => void, minInterval: number) => {
  const lastRefetchRef = useRef(Date.now());

  return () => {
    if (Date.now() - lastRefetchRef.current < minInterval) return;
    lastRefetchRef.current = Date.now();
    call();
  };
};
