'use client';

/**
 * Global error boundary that catches errors in root layout.
 * This replaces the entire HTML when an error occurs at the root level.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="bg-white">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
          <div className="text-center">
            <p className="text-base font-semibold text-red-600">Erreur critique</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              Une erreur inattendue s&apos;est produite
            </h1>
            <p className="mt-6 text-lg text-gray-500">
              L&apos;application a rencontré un problème. Veuillez réessayer.
            </p>
            <div className="mt-10">
              <button
                onClick={reset}
                className="rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
