'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface ParallaxImageProps extends Omit<ImageProps, 'style'> {
  /**
   * Scroll parallax intensity factor.
   * Positive value moves the image slightly upward as you scroll down.
   * Default: 0.1
   */
  speed?: number;
  /**
   * Container additional class names.
   */
  containerClassName?: string;
}

export default function ParallaxImage({
  speed = 0.1,
  containerClassName = '',
  className = '',
  alt = '',
  ...imageProps
}: ParallaxImageProps): React.ReactElement {
  const frameRef = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState<number>(0);
  const isVisibleRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return;
    }

    const frame = frameRef.current;
    if (!frame) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          scheduleUpdate();
        }
      },
      {
        root: null,
        rootMargin: '100px 0px 100px 0px',
        threshold: 0,
      }
    );

    observer.observe(frame);

    const calculateParallax = (): void => {
      if (!isVisibleRef.current || !frameRef.current) return;

      const rect = frameRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;

      // Progress relative to viewport center (-1 at top, +1 at bottom)
      const diff = (elementCenter - viewportCenter) / (viewportHeight / 2);
      // Damped for mobile screens
      const isMobile = window.innerWidth < 768;
      const scaleMultiplier = isMobile ? 0.5 : 1.0;
      
      // Maximum travel of ±24px on desktop, ±12px on mobile
      const travelMax = isMobile ? 12 : 24;
      const translation = Math.max(-travelMax, Math.min(travelMax, -diff * speed * 40 * scaleMultiplier));

      setOffsetY(Math.round(translation * 10) / 10);
    };

    const scheduleUpdate = (): void => {
      if (rafIdRef.current !== null) return;
      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null;
        calculateParallax();
      });
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    calculateParallax();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [speed]);

  return (
    <div
      ref={frameRef}
      className={`relative w-full h-full overflow-hidden ${containerClassName}`}
    >
      <div
        className="relative w-full h-full scale-[1.08] will-change-transform transition-transform duration-75 ease-out motion-reduce:transform-none motion-reduce:scale-100"
        style={{
          transform: `translate3d(0, ${offsetY}px, 0)`,
        }}
      >
        <Image
          alt={alt}
          {...imageProps}
          className={`object-cover ${className}`}
        />
      </div>
    </div>
  );

}
