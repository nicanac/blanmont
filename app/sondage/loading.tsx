import React from 'react';

export default function SondageLoading(): React.ReactElement {
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

      {/* Main Grid Skeleton */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 h-96 rounded-lg border border-[#e4e0d8] bg-white p-6" />
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-md border border-[#e4e0d8] bg-white" />
              ))}
            </div>
            <div className="h-48 rounded-lg border border-[#e4e0d8] bg-white" />
            <div className="h-64 rounded-lg border border-[#e4e0d8] bg-white" />
          </div>
        </div>
      </section>
    </main>
  );
}
