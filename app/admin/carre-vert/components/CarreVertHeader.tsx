'use client';

import React, { useState } from 'react';
import { CheckBadgeIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import SyncCarreVertButton from './SyncCarreVertButton';
import CarreVertTutorialModal from './CarreVertTutorialModal';
import { useAdminTours } from '../../components/tours/adminTours';

export default function CarreVertHeader(): React.ReactElement {
  const [modalOpen, setModalOpen] = useState(false);
  const { startCarreVertTour } = useAdminTours();

  return (
    <>
      <div id="carre-vert-header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e4e0d8]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#101216] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-2">
            <CheckBadgeIcon className="h-3.5 w-3.5 text-emerald-400" />
            <span>Challenge d&apos;Assiduité</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216]">
            Carré Vert
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5c6370]">
            Gestion, pointage des présences et synchronisation Google Sheets pour le classement officiel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-[#e4e0d8] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] hover:bg-[#f2efe9] transition-colors shadow-xs"
            title="Ouvrir le guide complet du Carré Vert"
          >
            <AcademicCapIcon className="h-4 w-4 text-emerald-600" />
            <span>Tutoriel &amp; Guide</span>
          </button>

          <div id="carre-vert-sync-btn">
            <SyncCarreVertButton />
          </div>
        </div>
      </div>

      <CarreVertTutorialModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onStartTour={() => {
          setTimeout(() => {
            startCarreVertTour();
          }, 200);
        }}
      />
    </>
  );
}
