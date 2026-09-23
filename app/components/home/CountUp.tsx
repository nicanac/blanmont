'use client';

import React, { useEffect, useRef } from 'react';

interface CountUpProps {
  value: number;
  durationMs?: number;
}

/**
 * Prints the final figure by default; when the figure starts below the fold it
 * counts up from zero as it scrolls into view, like a tally being written.
 * The count is written straight to the text node so React only ever renders the final value.
 */
export default function CountUp({ value, durationMs = 1100 }: CountUpProps): React.ReactElement {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || value <= 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.textContent = '0';
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number): void => {
          const t = Math.min(1, (now - start) / durationMs);
          const eased = 1 - Math.pow(1 - t, 4);
          el.textContent = String(Math.round(eased * value));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = String(value);
    };
  }, [value, durationMs]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}
