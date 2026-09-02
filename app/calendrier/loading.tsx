import React from 'react';

export default function CalendarLoading(): React.ReactElement {
  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {/* Editorial Cover Skeleton */}
      <section className="bg-[#0a0c10] border-b border-[#262b38] pt-14 pb-10 sm:pt-20 sm:pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-10 border-b border-white/10 animate-pulse">
            <div className="space-y-4 max-w-3xl">
              <div className="h-12 w-96 max-w-full rounded-md bg-white/10" />
              <div className="h-4 w-128 max-w-full rounded-md bg-white/5" />
            </div>
            <div className="h-11 w-56 rounded-md bg-white/10 shrink-0" />
          </div>

          {/* Telemetry Stat Strip Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 pt-6 animate-pulse">
            <div className="py-3 sm:py-0 sm:px-6 first:sm:pl-0 flex items-center gap-4">
              <div className="h-10 w-10 rounded-md bg-white/10 shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-6 w-32 rounded bg-white/10" />
                <div className="h-3 w-40 rounded bg-white/5" />
              </div>
            </div>
            <div className="py-3 sm:py-0 sm:px-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-md bg-white/10 shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-6 w-20 rounded bg-white/10" />
                <div className="h-3 w-36 rounded bg-white/5" />
              </div>
            </div>
            <div className="py-3 sm:py-0 sm:px-6 last:sm:pr-0 flex items-center gap-4">
              <div className="h-10 w-10 rounded-md bg-white/10 shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-6 w-20 rounded bg-white/10" />
                <div className="h-3 w-44 rounded bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agenda List Skeleton (matches default viewMode='agenda') */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-6">
        {/* Controls Skeleton */}
        <div className="rounded-lg border border-[#e4e0d8] bg-white p-4 sm:p-5 shadow-xs space-y-4 animate-pulse">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-48 rounded bg-[#f2efe9]" />
              <div className="h-10 w-32 rounded-md bg-[#f2efe9]" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-64 rounded-md bg-[#f2efe9]" />
              <div className="h-10 w-36 rounded-md bg-[#f2efe9]" />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-3 border-t border-[#e4e0d8]">
            <div className="h-10 w-24 rounded-md bg-[#f2efe9]" />
            <div className="h-10 w-28 rounded-md bg-[#f2efe9]" />
            <div className="h-10 w-32 rounded-md bg-[#f2efe9]" />
            <div className="h-10 w-36 rounded-md bg-[#f2efe9]" />
          </div>
        </div>

        {/* Agenda Card Skeletons */}
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-[#e4e0d8] bg-white p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
                <div className="w-16 sm:w-20 h-20 rounded-lg bg-[#f2efe9] shrink-0" />
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="h-5 w-40 rounded-full bg-[#f2efe9]" />
                  <div className="h-6 w-3/4 rounded bg-[#f2efe9]" />
                  <div className="h-4 w-1/2 rounded bg-[#f2efe9]" />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-[#e4e0d8]">
                <div className="h-10 w-28 rounded-md bg-[#f2efe9]" />
                <div className="h-10 w-28 rounded-md bg-[#f2efe9]" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
