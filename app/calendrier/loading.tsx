import React from 'react';
import { SheetHeaderSkeleton } from '@/app/components/carte/SheetHeaderSkeleton';

export default function CalendarLoading(): React.ReactElement {
  return (
    <main className="min-h-screen bg-paper dark:bg-night transition-colors duration-200">
      <SheetHeaderSkeleton />

      {/* Agenda List Skeleton (matches default viewMode='agenda') */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-6">
        {/* Controls Skeleton */}
        <div className="rounded-lg border border-line bg-white p-4 sm:p-5 shadow-xs space-y-4 animate-pulse">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-48 rounded bg-paper-2" />
              <div className="h-10 w-32 rounded-md bg-paper-2" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-64 rounded-md bg-paper-2" />
              <div className="h-10 w-36 rounded-md bg-paper-2" />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-3 border-t border-line">
            <div className="h-10 w-24 rounded-md bg-paper-2" />
            <div className="h-10 w-28 rounded-md bg-paper-2" />
            <div className="h-10 w-32 rounded-md bg-paper-2" />
            <div className="h-10 w-36 rounded-md bg-paper-2" />
          </div>
        </div>

        {/* Agenda Card Skeletons */}
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-line bg-white p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
                <div className="w-16 sm:w-20 h-20 rounded-lg bg-paper-2 shrink-0" />
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="h-5 w-40 rounded-full bg-paper-2" />
                  <div className="h-6 w-3/4 rounded bg-paper-2" />
                  <div className="h-4 w-1/2 rounded bg-paper-2" />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-line">
                <div className="h-10 w-28 rounded-md bg-paper-2" />
                <div className="h-10 w-28 rounded-md bg-paper-2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
