import React from 'react';

export default function MembersLoading(): React.ReactElement {
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

      {/* Members Grid Skeleton */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-8">
        <div className="h-14 w-full rounded-lg border border-[#e4e0d8] bg-white p-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-[#e4e0d8] bg-white overflow-hidden space-y-4 pb-4">
              <div className="aspect-[4/5] bg-[#f2efe9]" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-3/4 bg-[#f2efe9] rounded" />
                <div className="h-3 w-1/2 bg-[#f2efe9] rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
