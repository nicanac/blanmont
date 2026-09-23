import React from 'react';
import { SheetHeaderSkeleton } from '@/app/components/carte/SheetHeaderSkeleton';

export default function MembersLoading(): React.ReactElement {
  return (
    <main className="min-h-screen bg-paper dark:bg-night animate-pulse transition-colors duration-200">
      <SheetHeaderSkeleton />

      {/* Members Grid Skeleton */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-8">
        <div className="h-14 w-full rounded-lg border border-line dark:border-night-line bg-white dark:bg-ink p-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-ink overflow-hidden space-y-4 pb-4">
              <div className="aspect-[4/5] bg-paper-2 dark:bg-night-3" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-3/4 bg-paper-2 dark:bg-night-3 rounded" />
                <div className="h-3 w-1/2 bg-paper-2 dark:bg-night-3 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
