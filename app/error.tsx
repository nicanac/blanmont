'use client';

import { useEffect } from 'react';

/**
 * Error boundary for the app router.
 * Catches runtime errors in nested routes and displays a fallback UI.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to an error reporting service
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-brand-primary">Erreur</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          Une erreur s&apos;est produite
        </h1>
        <p className="mt-6 text-lg text-gray-500">
          Nous sommes désolés, quelque chose s&apos;est mal passé.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button
            onClick={reset}
            className="rounded-md bg-brand-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Réessayer
          </button>
          <a href="/" className="text-sm font-semibold text-gray-900">
            Retour à l&apos;accueil <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </div>
  );
}
