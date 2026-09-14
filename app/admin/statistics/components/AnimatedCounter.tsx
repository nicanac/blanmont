'use client';

import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Exponential ease-out matching the design system: cubic-bezier(0.16, 1, 0.3, 1)
 */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export default function AnimatedCounter({
  value,
  duration = 750,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedCounterProps): React.ReactElement {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const prevValueRef = useRef<number>(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const startValue = prevValueRef.current;
    const endValue = value;
    const delta = endValue - startValue;

    if (delta === 0) {
      setDisplayValue(value);
      return;
    }

    const startTime = performance.now();

    const updateCounter = (currentTime: number): void => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      const current = startValue + delta * easedProgress;
      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
      }
    };

    frameRef.current = requestAnimationFrame(updateCounter);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);

  const formatted =
    decimals > 0
      ? displayValue.toLocaleString('fr-FR', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : Math.round(displayValue).toLocaleString('fr-FR');

  return (
    <span className={`tabular-nums font-bold ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
