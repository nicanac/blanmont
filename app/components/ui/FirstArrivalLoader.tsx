'use client';

import React, { useEffect, useState } from 'react';

export default function FirstArrivalLoader() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Check if reduced motion is preferred
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      return;
    }

    // Check if intro has already been shown this session
    try {
      const alreadyShown = sessionStorage.getItem('ccb_first_arrival_shown');
      if (alreadyShown) {
        return;
      }
    } catch {
      // Ignore storage errors (e.g., privacy modes)
    }

    // Show first arrival intro
    setIsVisible(true);

    // Progress animation
    const p1 = setTimeout(() => setProgress(65), 250);
    const p2 = setTimeout(() => setProgress(100), 650);

    // Start exit transition
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      try {
        sessionStorage.setItem('ccb_first_arrival_shown', 'true');
      } catch {}
    }, 950);

    // Completely remove from DOM
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1450);

    return () => {
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const handleSkip = () => {
    setIsExiting(true);
    try {
      sessionStorage.setItem('ccb_first_arrival_shown', 'true');
    } catch {}
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0a0c10] text-white select-none transition-all duration-500 ease-out ${
        isExiting
          ? 'opacity-0 scale-105 pointer-events-none backdrop-blur-md'
          : 'opacity-100 scale-100 pointer-events-auto'
      }`}
      aria-label="Chargement du Club de Blanmont"
      role="status"
    >
      {/* Background kinetic ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#e03e3e]/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Main Kinetic Centerpiece */}
      <div className="relative z-10 flex flex-col items-center space-y-6 text-center px-4">
        {/* Animated Cycling Wheel / Spoke Icon */}
        <div className="relative flex items-center justify-center">
          <div className="relative h-20 w-20 flex items-center justify-center">
            {/* Outer spinning ring */}
            <svg
              className="absolute inset-0 h-full w-full animate-spin"
              style={{ animationDuration: '2.5s' }}
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="#e03e3e"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="60 180"
              />
            </svg>

            {/* Inner aerodynamic hub */}
            <div className="h-10 w-10 rounded-full bg-[#e03e3e] flex items-center justify-center shadow-lg shadow-red-500/30 transform transition-transform animate-pulse">
              <span className="text-white font-extrabold text-xs tracking-wider">
                CCB
              </span>
            </div>
          </div>
        </div>

        {/* Brand Wordmark & Typography */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/10 text-[#e03e3e] text-xs font-bold uppercase tracking-widest border border-white/10">
            CC Saint-Martin
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
            BLAN<span className="text-[#e03e3e]">MONT</span>
          </h1>

          <p className="text-xs font-medium text-slate-400 tracking-wider uppercase">
            Cyclo Club Saint-Martin • Brabant Wallon
          </p>
        </div>

        {/* Athletic Progress Bar */}
        <div className="w-48 sm:w-64 space-y-2 pt-2">
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-[#e03e3e] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 uppercase tracking-wider tabular-nums">
            <span>Mise en route</span>
            <span className="font-semibold text-slate-300">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute bottom-6 right-6 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-full border border-slate-800 hover:bg-slate-900 transition-colors z-20"
      >
        Passer l&apos;intro ✕
      </button>
    </div>
  );
}
