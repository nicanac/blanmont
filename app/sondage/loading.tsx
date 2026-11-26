import React from 'react';

export default function SondageLoading(): React.ReactElement {
  return (
    <main className="min-h-screen bg-paper dark:bg-night animate-pulse transition-colors duration-200">
      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* Same footprint as the quick-vote card, so the page does not jump when it loads. */}
        <div className="mx-auto h-[640px] max-w-3xl rounded-md border border-line bg-white dark:border-night-line dark:bg-night-2" />
      </section>
    </main>
  );
}
