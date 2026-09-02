import React from 'react';

export default function CalendarLoading(): React.ReactElement {
  return (
    <main className="min-h-screen bg-[#faf8f5] animate-pulse">
      {/* Cover Skeleton */}
      <section className="bg-[#0a0c10] border-b border-[#262b38] py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-6 w-48 rounded-full bg-white/10" />
          <div className="h-12 w-96 max-w-full rounded-md bg-white/10" />
          <div className="h-4 w-128 max-w-full rounded-md bg-white/5" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
            <div className="h-24 rounded-lg bg-white/5 border border-white/10" />
            <div className="h-24 rounded-lg bg-white/5 border border-white/10" />
            <div className="h-24 rounded-lg bg-white/5 border border-white/10" />
          </div>
        </div>
      </section>

      {/* Grid Skeleton */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="rounded-lg border border-[#e4e0d8] bg-white p-6 shadow-xs space-y-6">
          <div className="h-10 w-full rounded-md bg-[#f2efe9]" />
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-24 rounded-md bg-[#f2efe9]" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
