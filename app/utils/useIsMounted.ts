'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = (): (() => void) => {
  return () => {};
};

/**
 * SSR-safe hook to determine if the component has mounted on the client.
 * Returns false on SSR and initial client hydration, true immediately after hydration.
 * Uses useSyncExternalStore to eliminate cascading renders and react-hooks/set-state-in-effect lint errors.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
