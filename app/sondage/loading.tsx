import React from 'react';
import { SheetHeaderSkeleton } from '@/app/components/carte/SheetHeaderSkeleton';

export default function SondageLoading(): React.ReactElement {
  return (
    <main className="min-h-screen bg-paper dark:bg-night animate-pulse transition-colors duration-200">
      <SheetHeaderSkeleton />

      {/* Main Grid Skeleton */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 h-96 rounded-sm border border-line dark:border-night-line bg-white dark:bg-night-2 p-6" />
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-sm border border-line dark:border-night-line bg-white dark:bg-night-2" />
              ))}
            </div>
            <div className="h-48 rounded-sm border border-line dark:border-night-line bg-white dark:bg-night-2" />
            <div className="h-64 rounded-sm border border-line dark:border-night-line bg-white dark:bg-night-2" />
          </div>
        </div>
      </section>
    </main>
  );
}
