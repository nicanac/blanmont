import React from 'react';

export default function BlogLoading(): React.ReactElement {
  return (
    <main className="min-h-screen bg-[#faf8f5] animate-pulse motion-reduce:animate-none" aria-busy="true" aria-label="Chargement des articles...">
      {/* ──── Hero Cover Skeleton (Ink) ──── */}
      <section className="bg-[#0a0c10] border-b border-[#262b38] pt-14 pb-10 sm:pt-20 sm:pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-3 max-w-3xl pb-8 border-b border-white/10">
            <div className="h-12 w-96 max-w-full rounded-md bg-white/10" />
            <div className="h-4 w-full max-w-xl rounded-md bg-white/5" />
          </div>

          {/* Stat Strip Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 pt-2">
            <div className="py-3 sm:py-0 sm:px-6 first:sm:pl-0 flex items-center gap-4">
              <div className="h-10 w-10 rounded-md bg-white/10 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-6 w-12 rounded bg-white/15" />
                <div className="h-3 w-24 rounded bg-white/5" />
              </div>
            </div>
            <div className="py-3 sm:py-0 sm:px-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-md bg-white/10 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-6 w-12 rounded bg-white/15" />
                <div className="h-3 w-32 rounded bg-white/5" />
              </div>
            </div>
            <div className="py-3 sm:py-0 sm:px-6 last:sm:pr-0 flex items-center gap-4">
              <div className="h-10 w-10 rounded-md bg-white/10 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-5 w-36 rounded bg-white/15" />
                <div className="h-3 w-28 rounded bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Main Content Spread Skeleton (Paper) ──── */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-8">
        {/* Filter bar skeleton */}
        <div className="p-4 sm:p-5 rounded-lg border border-[#e4e0d8] bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="h-11 w-full max-w-md rounded-md bg-[#f2efe9]" />
          <div className="flex flex-wrap gap-2">
            <div className="h-11 w-20 rounded-full bg-[#f2efe9]" />
            <div className="h-11 w-28 rounded-full bg-[#f2efe9]" />
            <div className="h-11 w-28 rounded-full bg-[#f2efe9]" />
          </div>
        </div>

        {/* Featured Post Card Skeleton */}
        <div className="rounded-lg border border-[#e4e0d8] bg-white overflow-hidden space-y-4">
          <div className="aspect-[16/9] sm:aspect-[2/1] w-full bg-[#f2efe9]" />
          <div className="p-6 sm:p-8 space-y-3">
            <div className="h-8 w-2/3 rounded bg-[#f2efe9]" />
            <div className="h-4 w-full rounded bg-[#f2efe9]" />
            <div className="h-4 w-4/5 rounded bg-[#f2efe9]" />
            <div className="pt-4 border-t border-[#e4e0d8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-[#f2efe9]" />
                <div className="h-4 w-28 rounded bg-[#f2efe9]" />
              </div>
              <div className="h-4 w-24 rounded bg-[#f2efe9]" />
            </div>
          </div>
        </div>

        {/* Remaining 3-column Grid Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-[#e4e0d8] bg-white overflow-hidden space-y-4 pb-4">
              <div className="aspect-[16/10] bg-[#f2efe9]" />
              <div className="p-5 space-y-3">
                <div className="h-6 w-3/4 bg-[#f2efe9] rounded" />
                <div className="h-4 w-full bg-[#f2efe9] rounded" />
                <div className="h-4 w-2/3 bg-[#f2efe9] rounded" />
                <div className="pt-3 border-t border-[#e4e0d8] flex items-center justify-between">
                  <div className="h-6 w-20 bg-[#f2efe9] rounded" />
                  <div className="h-4 w-16 bg-[#f2efe9] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
