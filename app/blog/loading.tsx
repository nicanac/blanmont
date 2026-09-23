import React from 'react';
import { SheetHeaderSkeleton } from '@/app/components/carte/SheetHeaderSkeleton';

export default function BlogLoading(): React.ReactElement {
  return (
    <main className="min-h-screen bg-paper dark:bg-night animate-pulse motion-reduce:animate-none transition-colors duration-200" aria-busy="true" aria-label="Chargement des articles...">
      <SheetHeaderSkeleton />

      {/* ──── Main Content Spread Skeleton (Adaptive Surface) ──── */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-8">
        {/* Filter bar skeleton */}
        <div className="p-4 sm:p-5 rounded-lg border border-line dark:border-night-line bg-white dark:bg-ink flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="h-11 w-full max-w-md rounded-md bg-paper-2 dark:bg-night-3" />
          <div className="flex flex-wrap gap-2">
            <div className="h-11 w-20 rounded-full bg-paper-2 dark:bg-night-3" />
            <div className="h-11 w-28 rounded-full bg-paper-2 dark:bg-night-3" />
            <div className="h-11 w-28 rounded-full bg-paper-2 dark:bg-night-3" />
          </div>
        </div>

        {/* Featured Post Card Skeleton */}
        <div className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-ink overflow-hidden space-y-4">
          <div className="aspect-[16/9] sm:aspect-[2/1] w-full bg-paper-2 dark:bg-night-3" />
          <div className="p-6 sm:p-8 space-y-3">
            <div className="h-8 w-2/3 rounded bg-paper-2 dark:bg-night-3" />
            <div className="h-4 w-full rounded bg-paper-2 dark:bg-night-3" />
            <div className="h-4 w-4/5 rounded bg-paper-2 dark:bg-night-3" />
            <div className="pt-4 border-t border-line dark:border-night-line flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 md:h-7 md:w-7 rounded-full bg-paper-2 dark:bg-night-3" />
                <div className="h-4 w-28 rounded bg-paper-2 dark:bg-night-3" />
              </div>
              <div className="h-4 w-24 rounded bg-paper-2 dark:bg-night-3" />
            </div>
          </div>
        </div>

        {/* Remaining 3-column Grid Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-ink overflow-hidden space-y-4 pb-4">
              <div className="aspect-[16/10] bg-paper-2 dark:bg-night-3" />
              <div className="p-5 space-y-3">
                <div className="h-6 w-3/4 bg-paper-2 dark:bg-night-3 rounded" />
                <div className="h-4 w-full bg-paper-2 dark:bg-night-3 rounded" />
                <div className="h-4 w-2/3 bg-paper-2 dark:bg-night-3 rounded" />
                <div className="pt-3 border-t border-line dark:border-night-line flex items-center justify-between">
                  <div className="h-6 w-20 bg-paper-2 dark:bg-night-3 rounded" />
                  <div className="h-4 w-16 bg-paper-2 dark:bg-night-3 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
