import React from 'react';
import { SheetHeaderSkeleton } from '@/app/components/carte/SheetHeaderSkeleton';

export default function SondageLoading(): React.ReactElement {
  return (
    <main className="min-h-screen bg-paper dark:bg-night animate-pulse transition-colors duration-200">
      <SheetHeaderSkeleton />
      {/* Same grid as the stats under the cartouche: group split (5) + participants (7). */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="h-80 rounded-sm border border-line bg-white lg:col-span-5 dark:border-night-line dark:bg-night-2" />
          <div className="h-96 rounded-sm border border-line bg-white lg:col-span-7 dark:border-night-line dark:bg-night-2" />
        </div>
      </section>
    </main>
  );
}
