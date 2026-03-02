import { useEffect, useRef } from 'react';

/**
 * Generic polling hook that replaces repeated `useEffect + setInterval` patterns.
 * Automatically cleans up on unmount or when `enabled` becomes false.
 *
 * @param callback - Function to call on each interval tick
 * @param interval - Polling interval in milliseconds
 * @param enabled - Whether polling is active (defaults to true)
 */
export default function usePolling(
  callback: () => void,
  interval: number,
  enabled: boolean = true,
) {
  const callbackRef = useRef(callback);

  // Keep callback ref up to date without re-triggering the effect
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return undefined;

    const id = setInterval(() => {
      callbackRef.current();
    }, interval);

    return () => {
      clearInterval(id);
    };
  }, [interval, enabled]);
}
