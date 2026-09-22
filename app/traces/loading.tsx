import React from 'react';
import { Spinner } from '@/app/components/ui/Spinner';

export default function TracesLoading(): React.ReactElement {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-[#faf8f5] dark:bg-[#0a0c10] transition-colors duration-200">
      <div className="space-y-4 text-center">
        <Spinner size="lg" />
        <p className="text-xs font-semibold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb]">
          Chargement des parcours GPX...
        </p>
      </div>
    </div>
  );
}
