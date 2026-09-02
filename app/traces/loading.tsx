import React from 'react';

export default function TracesLoading(): React.ReactElement {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-[#faf8f5]">
      <div className="space-y-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e4e0d8] border-t-[#e03e3e] mx-auto" />
        <p className="text-xs font-semibold uppercase tracking-wider text-[#5c6370]">
          Chargement des parcours GPX...
        </p>
      </div>
    </div>
  );
}
