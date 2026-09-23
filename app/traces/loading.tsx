import React from 'react';
import { SheetHeaderSkeleton } from '@/app/components/carte/SheetHeaderSkeleton';

export default function TracesLoading(): React.ReactElement {
  return (
    <main className="min-h-screen bg-paper dark:bg-night transition-colors duration-200">
      <SheetHeaderSkeleton />

      {/* Grid of trace card skeletons */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-line dark:border-night-line pb-6 animate-pulse">
          <div className="h-6 w-48 rounded bg-paper-2 dark:bg-night-line" />
          <div className="h-10 w-24 rounded-md bg-paper-2 dark:bg-night-line" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-night-2 p-5 shadow-xs space-y-4 animate-pulse"
            >
              <div className="aspect-[16/9] w-full rounded-md bg-paper-2 dark:bg-night-line" />
              <div className="space-y-2">
                <div className="h-5 w-3/4 rounded bg-paper-2 dark:bg-night-line" />
                <div className="h-4 w-1/2 rounded bg-paper-2 dark:bg-night-line" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-line dark:border-night-line">
                <div className="h-4 w-20 rounded bg-paper-2 dark:bg-night-line" />
                <div className="h-4 w-16 rounded bg-paper-2 dark:bg-night-line" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
