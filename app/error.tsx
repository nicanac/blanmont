'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
  CalendarDaysIcon,
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
      className="flex min-h-[75vh] flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8 bg-paper dark:bg-night"
    >
      <div className="neatline w-full max-w-xl space-y-6 bg-white p-8 sm:p-10 dark:bg-night-2">
        <div className="space-y-3">
          <h1 className="font-wide text-3xl font-extrabold uppercase leading-[0.95] text-ink sm:text-4xl dark:text-snow">
            Une interruption est survenue
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-ink-2 sm:text-base dark:text-snow-2">
            <ExclamationTriangleIcon
              className="mr-1 inline size-4 -translate-y-px text-brand"
              aria-hidden="true"
            />
            Le peloton a rencontré un imprévu technique. Vous pouvez relancer la page ou retourner
            aux parcours.
          </p>
        </div>

        {error.digest && (
          <div className="inline-block rounded-sm border border-line bg-paper-2 p-2.5 font-mono text-xs text-ink-3 dark:border-night-line dark:bg-night-3 dark:text-snow-3">
            Code d&apos;incident :{' '}
            <span className="select-all text-ink dark:text-snow">{error.digest}</span>
          </div>
        )}

        <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-brand px-6 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-brand-strong disabled:opacity-50 sm:w-auto"
          >
            <ArrowPathIcon
              className={`size-4 ${isRetrying ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>{isRetrying ? 'Tentative en cours...' : 'Réessayer'}</span>
          </button>

          <Link
            href="/"
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border border-ink px-6 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-white sm:w-auto dark:border-snow-2 dark:text-snow dark:hover:bg-snow dark:hover:text-night"
          >
            <HomeIcon className="size-4" aria-hidden="true" />
            <span>Accueil du club</span>
          </Link>

          <Link
            href="/calendrier"
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border border-ink px-6 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-white sm:w-auto dark:border-snow-2 dark:text-snow dark:hover:bg-snow dark:hover:text-night"
          >
            <CalendarDaysIcon className="size-4" aria-hidden="true" />
            <span>Calendrier</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
