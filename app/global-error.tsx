'use client';

/**
 * Global error boundary that catches errors in root layout.
 * Replaces the full document shell in case of fatal error with an accessible fallback.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-night text-snow flex flex-col items-center justify-center p-6 font-sans antialiased">
        <div className="w-full max-w-md text-center space-y-6 rounded-lg border border-night-line bg-night-2 p-8 shadow-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand/15 border border-brand/30 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand">
            <span>CC Saint-Martin Blanmont</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
              Erreur Critique
            </h1>
            <p className="text-xs sm:text-sm text-snow-3 leading-relaxed">
              Une erreur inattendue a interrompu l&apos;application. Veuillez recharger la page.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full inline-flex items-center justify-center rounded-md bg-brand hover:bg-brand-strong text-white px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors shadow-md"
            >
              Recharger l&apos;application
            </button>
            <a
              href="/"
              className="w-full inline-flex items-center justify-center rounded-md border border-night-line bg-white/5 hover:bg-white/10 text-snow px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Retour au site
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
