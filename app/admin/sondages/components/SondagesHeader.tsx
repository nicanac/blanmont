'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import SondagesTutorialModal from './SondagesTutorialModal';
import { useAdminTours } from '../../components/tours/adminTours';

interface SondagesHeaderProps {
  sessionCount: number;
}

export default function SondagesHeader({
  sessionCount,
}: SondagesHeaderProps): React.ReactElement {
  const [modalOpen, setModalOpen] = useState(false);
  const { startSondagesTour } = useAdminTours();

  return (
    <>
      <div id="sondages-header-section" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e4e0d8]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#101216] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-2">
            <ChatBubbleLeftRightIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
            <span>Rituel Hebdomadaire</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216]">
            Sondages du Weekend
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5c6370]">
            {sessionCount} session{sessionCount !== 1 ? 's' : ''} de vote enregistrée{sessionCount !== 1 ? 's' : ''}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-[#e4e0d8] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] hover:bg-[#f2efe9] transition-colors shadow-xs"
            title="Ouvrir le guide des sondages du weekend"
          >
            <AcademicCapIcon className="h-4 w-4 text-[#e03e3e]" />
            <span>Tutoriel &amp; Guide</span>
          </button>

          <Link
            id="sondages-new-btn"
            href="/admin/sondages/new"
            className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs shrink-0"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nouveau Sondage</span>
          </Link>
        </div>
      </div>

      <SondagesTutorialModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onStartTour={() => {
          setTimeout(() => {
            startSondagesTour();
          }, 200);
        }}
      />
    </>
  );
}
