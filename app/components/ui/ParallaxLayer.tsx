'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ParallaxLayerProps {
  children: React.ReactNode;
  /**
   * Parallax speed coefficient.
   * Positive values move with scroll direction;
   * Negative values resist scroll direction (lagging behind for deep background feel).
   * Recommended range: -0.3 to 0.3.
   * Default: -0.15
   */
  speed?: number;
  /**
   * Additional CSS classes for the container.
   */
  className?: string;
  /**
   * HTML tag to render. Defaults to 'div'.
   */
  as?: React.ElementType;
  /**
   * Maximum translation in pixels to avoid clipping or excessive movement.
   * Default: 120px
   */
  maxOffset?: number;
  /**
   * Axis of parallax movement.
   * Default: 'vertical'
   */
  direction?: 'vertical' | 'horizontal';
}

export default function ParallaxLayer({
  children,
  speed = -0.15,
  className = '',
  as: Component = 'div',
  maxOffset = 120,
  direction = 'vertical',
}: ParallaxLayerProps): React.ReactElement {
  const containerRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState<number>(0);
  const isVisibleRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    // 1. Accessibility: Check for prefers-reduced-motion
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    // 2. IntersectionObserver: Only attach/calculate when in or near viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          scheduleUpdate();
        }
      },
      {
        root: null,
        rootMargin: '200px 0px 200px 0px',
        threshold: 0,
      }
    );

    observer.observe(element);

    const calculateOffset = (): void => {
      if (!isVisibleRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportCenter = viewportHeight / 2;
      const elementCenter = rect.top + rect.height / 2;

      // Distance from center of viewport (-viewportCenter to +viewportCenter)
      const distanceFromCenter = elementCenter - viewportCenter;

      // Damping on small mobile screens
      const isMobile = window.innerWidth < 768;
      const dampingFactor = isMobile ? 0.6 : 1.0;

      // Calculate translation
      let rawOffset = distanceFromCenter * speed * dampingFactor;

      // Clamp within max bounds
      if (Math.abs(rawOffset) > maxOffset) {
        rawOffset = Math.sign(rawOffset) * maxOffset;
      }

      setOffset(Math.round(rawOffset * 10) / 10);
    };

    const scheduleUpdate = (): void => {
      if (rafIdRef.current !== null) return;
      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null;
        calculateOffset();
      });
    };


    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    // Initial calculation
    calculateOffset();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [speed, maxOffset, direction]);

  const transformStyle =
    direction === 'vertical'
      ? `translate3d(0, ${offset}px, 0)`
      : `translate3d(${offset}px, 0, 0)`;

  return (
    <Component
      ref={containerRef}
      className={`will-change-transform transition-transform duration-75 ease-out motion-reduce:transform-none ${className}`}
      style={{ transform: transformStyle }}
    >
      {children}
    </Component>
  );
}
