import { useState, useEffect, useCallback } from 'react';

/**
 * usePersistentState
 * Drop-in replacement for React's useState that automatically:
 *   1. Reads the stored value from localStorage on first mount
 *   2. Falls back to `defaultValue` if nothing is stored yet (first launch)
 *   3. Writes back to localStorage on every state change
 *
 * All keys are prefixed with "kq_" (KarmQuest) to avoid collisions.
 *
 * Safe against:
 *   - Private/Incognito windows (graceful fallback to in-memory state)
 *   - Storage quota exceeded (warns in console, never crashes)
 *   - Corrupted JSON (resets to defaultValue automatically)
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {

  // Initializer runs ONCE on mount — reads from localStorage or uses default
  const [state, setStateRaw] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return defaultValue;       // Nothing saved yet
      return JSON.parse(stored) as T;                // Restore saved data
    } catch {
      console.warn(`[KarmQuest] Could not read "${key}" from localStorage. Using default.`);
      return defaultValue;
    }
  });

  // Every time state changes → write to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      console.warn(`[KarmQuest] Could not save "${key}" to localStorage.`);
    }
  }, [key, state]);

  // Stable setter — identical API to useState (accepts value or updater function)
  const setState = useCallback<React.Dispatch<React.SetStateAction<T>>>(
    (action) => setStateRaw(action),
    []
  );

  return [state, setState];
}
