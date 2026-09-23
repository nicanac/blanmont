'use client';

import { useEffect, type RefObject } from 'react';

type GsapModule = typeof import('./motion');

/**
 * Runs a GSAP setup against a scoped root once the page has hydrated.
 * GSAP and ScrollTrigger are loaded on demand, so they never execute during
 * hydration and never ship in the critical path of a page.
 */
export function useSheetMotion(
  root: RefObject<HTMLElement | null>,
  setup: (motion: GsapModule, scope: HTMLElement) => void
): void {
  useEffect(() => {
    const scope = root.current;
    if (!scope) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let cancelled = false;
    let revert: (() => void) | undefined;

    import('./motion').then((motion) => {
      if (cancelled) return;
      const ctx = motion.gsap.context(() => setup(motion, scope), scope);
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
    // The setup runs once per mount; callers pass a stable function.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root]);
}
