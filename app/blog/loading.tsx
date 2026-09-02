import React from 'react';

export default function BlogLoading(): React.ReactElement {
  return (
    <main className="min-h-screen bg-[#faf8f5] animate-pulse">
      {/* Cover Skeleton */}
      <section className="bg-[#0a0c10] border-b border-[#262b38] py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-6 w-48 rounded-full bg-white/10" />
          <div className="h-12 w-96 max-w-full rounded-md bg-white/10" />
          <div className="h-4 w-128 max-w-full rounded-md bg-white/5" />
        </div>
      </section>

      {/* Blog Grid Skeleton */}
      <section className="max-w-7xl mx-auto px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-[#e4e0d8] bg-white overflow-hidden space-y-4 pb-4">
              <div className="aspect-[16/10] bg-[#f2efe9]" />
              <div className="p-5 space-y-3">
                <div className="h-6 w-3/4 bg-[#f2efe9] rounded" />
                <div className="h-4 w-full bg-[#f2efe9] rounded" />
                <div className="h-4 w-2/3 bg-[#f2efe9] rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
