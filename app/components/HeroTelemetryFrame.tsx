'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

import Image from 'next/image';
import {
  MapPinIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ClockIcon,
  TrophyIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { HeroSettings, HeroIconType } from '@/app/types';

interface HeroTelemetryFrameProps {
  settings: HeroSettings;
  className?: string;
  isPreview?: boolean;
  /** Render the telemetry cards bar under the photos (the home prints the cards in its cover). */
  showCards?: boolean;
}

function renderCardIcon(type: HeroIconType): React.ReactElement {
  const iconClass = 'h-4 w-4';
  switch (type) {
    case 'pin':
      return <MapPinIcon className={iconClass} />;
    case 'calendar':
      return <CalendarDaysIcon className={`${iconClass} text-brand`} />;
    case 'group':
      return <UserGroupIcon className={`${iconClass} text-brand`} />;
    case 'clock':
      return <ClockIcon className={`${iconClass} text-brand`} />;
    case 'trophy':
      return <TrophyIcon className={`${iconClass} text-brand`} />;
    case 'sparkles':
      return <SparklesIcon className={`${iconClass} text-brand`} />;
    default:
      return <MapPinIcon className={iconClass} />;
  }
}

export default function HeroTelemetryFrame({
  settings,
  className = '',
  isPreview: _isPreview = false,
  showCards = true,
}: HeroTelemetryFrameProps): React.ReactElement {
  const slides = settings?.slides?.length ? settings.slides : [{ id: '1', url: '/images/home-hero.jpg', alt: 'Club de Blanmont' }];
  const cards = settings?.cards?.length ? settings.cards : [];
  const badge = settings?.badge || 'Peloton CC Saint-Martin · Blanmont';

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const frameRef = useRef<HTMLDivElement>(null);
  const [parallaxOffset, setParallaxOffset] = useState<number>(0);

  // Parallax depth on hero image viewport
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    const frame = frameRef.current;
    if (!frame) return;

    if (_isPreview) return;

    let isVisible = false;
    let rafId: number | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) schedule();
      },
      { rootMargin: '100px 0px 100px 0px' }
    );
    observer.observe(frame);

    const updateParallax = (): void => {
      if (!isVisible || !frameRef.current) return;
      const rect = frameRef.current.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const diff = elementCenter - viewportCenter;
      const isMobile = window.innerWidth < 768;
      const damping = isMobile ? 0.03 : 0.05;
      const raw = diff * damping;
      const clamped = Math.max(-18, Math.min(18, raw));
      setParallaxOffset(Math.round(clamped * 10) / 10);
    };

    const schedule = (): void => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateParallax();
      });
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    updateParallax();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Auto-cycle through slides if there are multiple
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  const activeSlideIndex = currentSlideIndex < slides.length ? currentSlideIndex : 0;

  const goToPrev = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);


  return (
    <div
      className={`overflow-hidden rounded-lg border border-line dark:border-night-line bg-white dark:bg-ink transition-colors duration-200 ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Hard-cropped photo / Slider viewport with parallax ── */}
      <div
        ref={frameRef}
        className="relative aspect-[16/10] sm:aspect-[2/1] lg:aspect-[21/9] w-full overflow-hidden bg-night"
      >
        <div
          className="absolute -top-10 -bottom-10 left-0 right-0 scale-[1.02] will-change-transform transition-transform duration-75 ease-out motion-reduce:transform-none motion-reduce:top-0 motion-reduce:bottom-0 motion-reduce:scale-100"
          style={{ transform: `translate3d(0, ${parallaxOffset}px, 0)` }}
        >
          {slides.map((slide, index) => {
            const isActive = index === activeSlideIndex;
            return (
              <div
                key={slide.id || index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                }`}
              >
                <Image
                  src={failedImages[slide.id || index] ? '/images/home-hero.jpg' : slide.url}
                  alt={slide.alt || 'Club de Blanmont – peloton cycliste'}
                  fill
                  unoptimized
                  referrerPolicy="no-referrer"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                  style={{ objectPosition: slide.position || 'center center' }}
                  onError={() => {
                    setFailedImages((prev) => ({ ...prev, [slide.id || index]: true }));
                  }}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
            );
          })}
        </div>


        {/* Top-left editorial pill */}
        <div className="absolute top-4 left-4 z-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-night/85 border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
            <span>{badge}</span>
          </div>
        </div>

        {/* Carousel controls */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
            <div className="flex items-center bg-night/85 border border-white/15 rounded-lg p-0.5">
              <button
                type="button"
                onClick={goToPrev}
                aria-label="Photo précédente"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-0.5 px-0.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlideIndex(idx)}
                    aria-label={`Aller à la photo ${idx + 1}`}
                    className="min-h-[44px] min-w-[44px] sm:min-w-[28px] flex items-center justify-center p-1 cursor-pointer"
                  >
                    <span
                      className={`h-1.5 rounded-full transition-all duration-300 block ${
                        activeSlideIndex === idx
                          ? 'w-5 bg-brand'
                          : 'w-1.5 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={goToNext}
                aria-label="Photo suivante"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Seamless Telemetry Bar (4 Cards) ── */}
      {showCards && (
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-line dark:divide-white/10 border-t border-line dark:border-white/10 bg-paper dark:bg-night-2 transition-colors duration-200">
          {cards.map((card, idx) => {
            const isFirst = idx === 0;
            return (
              <div key={card.id || idx} className="p-4 sm:p-5 flex items-center gap-3.5">
                <div
                  className={`rounded-md p-2 shrink-0 ${
                    isFirst
                      ? 'bg-brand/10 border border-brand/25 text-brand'
                      : 'bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-ink dark:text-snow'
                  }`}
                >
                  {renderCardIcon(card.icon)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3 truncate">
                    {card.label}
                  </div>
                  <div className="mt-0.5 text-sm font-bold text-ink dark:text-white tabular-nums leading-tight truncate">
                    {card.value}
                    {card.detail && (
                      <span className="text-xs font-normal text-ink-3 dark:text-snow-3 ml-1">
                        {card.detail}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
