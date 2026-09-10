'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  MapIcon,
} from '@heroicons/react/24/outline';
import MergeGpxForm from './components/MergeGpxForm';

export default function MergeGpxPage(): React.ReactElement {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e4e0d8]">
        <div>
          <Link
            href="/admin/traces"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7d8493] hover:text-[#101216] transition-colors mb-4"
          >
            <ArrowLeftIcon className="h-3 w-3" />
            <span>Retour aux Parcours</span>
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#101216] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              <MapIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
              <span>Outil GPX</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216]">
            Fusionner des Traces GPX
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5c6370] max-w-[65ch]">
            Combinez plusieurs fichiers GPX en un seul itinéraire. Idéal pour relier une trace existante à un nouveau départ, ou assembler plusieurs tronçons.
          </p>
        </div>
      </div>

      <MergeGpxForm />
    </div>
  );
}
