'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CalendarDaysIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import EventsTutorialModal from './EventsTutorialModal';
import { useAdminTours } from '../../components/tours/adminTours';

interface EventsHeaderProps {
  upcomingCount: number;
}

export default function EventsHeader({
  upcomingCount,
}: EventsHeaderProps): React.ReactElement {
  const [modalOpen, setModalOpen] = useState(false);
  const { startEventsTour } = useAdminTours();

  return (
    <>
      <div id="events-header-section" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e4e0d8]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#101216] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-2">
            <CalendarDaysIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
            <span>Planning Officiel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216]">
            Événements &amp; Sorties
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5c6370]">
            {upcomingCount} sortie{upcomingCount !== 1 ? 's' : ''} à venir au calendrier.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tuto Button */}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-[#e4e0d8] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] hover:bg-[#f2efe9] transition-colors shadow-xs"
            title="Ouvrir le guide du calendrier"
          >
            <AcademicCapIcon className="h-4 w-4 text-[#e03e3e]" />
            <span>Tutoriel &amp; Guide</span>
          </button>

          {/* Import PDF Button */}
          <Link
            id="events-import-pdf-btn"
            href="/admin/events/import"
            className="inline-flex items-center gap-2 rounded-md border border-[#e4e0d8] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] hover:bg-[#f2efe9] transition-colors shadow-xs"
          >
            <ArrowUpTrayIcon className="h-4 w-4 text-[#7d8493]" />
            <span>Importer PDF</span>
          </Link>

          {/* New Event Button */}
          <Link
            id="events-new-btn"
            href="/admin/events/new"
            className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nouvelle Sortie</span>
          </Link>
        </div>
      </div>

      <EventsTutorialModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onStartTour={() => {
          setTimeout(() => {
            startEventsTour();
          }, 200);
        }}
      />
    </>
  );
}
