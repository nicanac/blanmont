import React from 'react';

export default function TracesLoading(): React.ReactElement {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-[#faf8f5] dark:bg-[#0a0c10] transition-colors duration-200">
      <div className="space-y-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e4e0d8] dark:border-[#262b38] border-t-[#e03e3e] mx-auto" />
        <p className="text-xs font-semibold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb]">
          Chargement des parcours GPX...
        </p>
      </div>
    </div>
  );
}
