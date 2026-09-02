'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
  MapIcon,
} from '@heroicons/react/24/outline';

/**
 * Error boundary for the app router.
 * Catches runtime errors in nested routes and displays a resilient Editorial Peloton UI.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Log error to console / error reporting service
    console.error('App error boundary caught:', error);
  }, [error]);

  const handleRetry = () => {
    setIsRetrying(true);
    try {
      reset();
    } finally {
      setTimeout(() => setIsRetrying(false), 500);
    }
  };

  return (
    <main
      role="alert"
      aria-live="assertive"
      className="flex min-h-[75vh] flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8 bg-[#faf8f5]"
    >
      <div className="w-full max-w-lg text-center space-y-6">
        {/* Editorial Pill Status */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[#101216] px-3.5 py-1 text-xs font-bold uppercase tracking-[0.08em] text-white mx-auto shadow-xs">
          <ExclamationTriangleIcon className="h-4 w-4 text-[#e03e3e]" />
          <span>Incident Technique</span>
        </div>

        {/* Display Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#101216]">
            Une interruption est survenue
          </h1>
          <p className="text-sm sm:text-base text-[#5c6370] max-w-md mx-auto leading-relaxed">
            Le peloton a rencontré un imprévu technique. Vous pouvez relancer la page ou retourner aux parcours.
          </p>
        </div>

        {/* Technical Digest Details (Collapsible for debug) */}
        {error.digest && (
          <div className="text-xs font-mono text-[#7d8493] bg-[#f2efe9] border border-[#e4e0d8] p-2.5 rounded-md inline-block">
            Code d&apos;incident : <span className="text-[#101216] select-all">{error.digest}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.06em] transition-colors shadow-md disabled:opacity-50 min-h-[44px]"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Tentative en cours...' : 'Réessayer'}</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-[#e4e0d8] bg-white hover:bg-[#f2efe9] text-[#101216] px-6 py-3 text-xs font-semibold uppercase tracking-[0.06em] transition-colors min-h-[44px]"
          >
            <HomeIcon className="h-4 w-4 text-[#7d8493]" />
            <span>Accueil du club</span>
          </Link>

          <Link
            href="/traces"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-[#e4e0d8] bg-white hover:bg-[#f2efe9] text-[#101216] px-6 py-3 text-xs font-semibold uppercase tracking-[0.06em] transition-colors min-h-[44px]"
          >
            <MapIcon className="h-4 w-4 text-[#7d8493]" />
            <span>Parcours</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
