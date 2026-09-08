'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
}

function renderCardIcon(type: HeroIconType) {
  const iconClass = 'h-4 w-4';
  switch (type) {
    case 'pin':
      return <MapPinIcon className={iconClass} />;
    case 'calendar':
      return <CalendarDaysIcon className={`${iconClass} text-[#e03e3e]`} />;
    case 'group':
      return <UserGroupIcon className={`${iconClass} text-[#e03e3e]`} />;
    case 'clock':
      return <ClockIcon className={`${iconClass} text-[#e03e3e]`} />;
    case 'trophy':
      return <TrophyIcon className={`${iconClass} text-[#e03e3e]`} />;
    case 'sparkles':
      return <SparklesIcon className={`${iconClass} text-[#e03e3e]`} />;
    default:
      return <MapPinIcon className={iconClass} />;
  }
}

export default function HeroTelemetryFrame({
  settings,
  className = '',
  isPreview = false,
}: HeroTelemetryFrameProps): React.ReactElement {
  const slides = settings?.slides?.length ? settings.slides : [{ id: '1', url: '/images/home-hero.jpg', alt: 'Club de Blanmont' }];
  const cards = settings?.cards?.length ? settings.cards : [];
  const badge = settings?.badge || 'Peloton CC Saint-Martin · Blanmont';

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Auto-cycle through slides if there are multiple
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  // Keep index within bounds if slides count changes
  useEffect(() => {
    if (currentSlideIndex >= slides.length) {
      setCurrentSlideIndex(0);
    }
  }, [slides.length, currentSlideIndex]);

  const goToPrev = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  return (
    <div
      className={`overflow-hidden rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#101216] shadow-xl dark:shadow-2xl transition-colors duration-200 ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Hard-cropped photo / Slider viewport ── */}
      <div className="relative aspect-[16/10] sm:aspect-[2/1] lg:aspect-[21/9] w-full overflow-hidden bg-[#0a0c10]">
        {slides.map((slide, index) => {
          const isActive = index === currentSlideIndex;
          return (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={failedImages[slide.id || index] ? '/images/home-hero.jpg' : slide.url}
                alt={slide.alt || 'Club de Blanmont – peloton cycliste'}
                style={{ objectPosition: slide.position || 'center center' }}
                referrerPolicy="no-referrer"
                onError={() => {
                  setFailedImages((prev) => ({ ...prev, [slide.id || index]: true }));
                }}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
          );
        })}

        {/* Top-left editorial pill */}
        <div className="absolute top-4 left-4 z-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0a0c10]/80 backdrop-blur-sm border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e03e3e] animate-pulse" />
            <span>{badge}</span>
          </div>
        </div>

        {/* Carousel controls */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
            <div className="flex items-center bg-[#0a0c10]/70 backdrop-blur-sm border border-white/10 rounded-full p-1">
              <button
                type="button"
                onClick={goToPrev}
                aria-label="Photo précédente"
                className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ChevronLeftIcon className="h-3.5 w-3.5" />
              </button>

              <div className="flex items-center gap-1.5 px-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlideIndex(idx)}
                    aria-label={`Aller à la photo ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentSlideIndex === idx
                        ? 'w-5 bg-[#e03e3e]'
                        : 'w-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={goToNext}
                aria-label="Photo suivante"
                className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Seamless Telemetry Bar (4 Cards) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#e4e0d8] dark:divide-white/10 border-t border-[#e4e0d8] dark:border-white/10 bg-[#f7f5f0] dark:bg-[#161922] transition-colors duration-200">
        {cards.map((card, idx) => {
          const isFirst = idx === 0;
          return (
            <div key={card.id || idx} className="p-4 sm:p-5 flex items-center gap-3.5">
              <div
                className={`rounded-md p-2 shrink-0 ${
                  isFirst
                    ? 'bg-[#e03e3e]/10 border border-[#e03e3e]/25 text-[#e03e3e]'
                    : 'bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[#101216] dark:text-[#f5f6f8]'
                }`}
              >
                {renderCardIcon(card.icon)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#7d8493] truncate">
                  {card.label}
                </div>
                <div className="mt-0.5 text-sm font-bold text-[#101216] dark:text-white tabular-nums leading-tight truncate">
                  {card.value}
                  {card.detail && (
                    <span className="text-xs font-normal text-[#5c6370] dark:text-[#a7adbb] ml-1">
                      {card.detail}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
