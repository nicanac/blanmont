'use client';

import React, { useState } from 'react';
import {
  ChartBarIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import StatisticsTutorialModal from './StatisticsTutorialModal';
import { useAdminTours } from '../../components/tours/adminTours';

export default function StatisticsHeader(): React.ReactElement {
  const [modalOpen, setModalOpen] = useState(false);
  const { startStatisticsTour } = useAdminTours();

  return (
    <>
      <div id="stats-header-section" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e4e0d8]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#101216] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-2">
            <ChartBarIcon className="h-3.5 w-3.5 text-purple-400" />
            <span>Tableau de Bord Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216]">
            Statistiques &amp; Affluence
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5c6370]">
            Analyse consolidée des présences, de la régularité et des dynamiques de groupes.
          </p>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-[#e4e0d8] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] hover:bg-[#f2efe9] transition-colors shadow-xs"
            title="Ouvrir le guide d'analyse statistique"
          >
            <AcademicCapIcon className="h-4 w-4 text-purple-600" />
            <span>Tutoriel &amp; Guide</span>
          </button>
        </div>
      </div>

      <StatisticsTutorialModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onStartTour={() => {
          setTimeout(() => {
            startStatisticsTour();
          }, 200);
        }}
      />
    </>
  );
}
