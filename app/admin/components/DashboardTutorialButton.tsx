'use client';

import React, { useState } from 'react';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import Tooltip from '@/app/components/ui/Tooltip';
import DashboardTutorialModal from './DashboardTutorialModal';
import { useAdminTours } from './tours/adminTours';

export default function DashboardTutorialButton(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const { startDashboardTour } = useAdminTours();

  return (
    <>
      <Tooltip
        content="Guide & Visite interactive du Quartier Général"
        badge="Guide"
        side="top"
        followPointer
      >
        <button
          id="dashboard-tutorial-btn"
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 px-3 py-1.5 text-xs font-narrow font-semibold uppercase tracking-wider text-ink dark:text-snow hover:bg-line dark:hover:bg-night-3 transition-colors cursor-pointer active:translate-y-px"
          aria-label="Ouvrir le guide du Quartier Général"
        >
          <AcademicCapIcon className="h-4 w-4 text-brand" />
          <span>Guide du QG</span>
        </button>
      </Tooltip>

      <DashboardTutorialModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onStartTour={() => {
          setTimeout(() => {
            startDashboardTour();
          }, 200);
        }}
      />
    </>
  );
}
