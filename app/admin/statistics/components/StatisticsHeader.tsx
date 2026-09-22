'use client';

import React, { useState } from 'react';
import { SignalIcon } from '@heroicons/react/24/outline';
import StatisticsTutorialModal from './StatisticsTutorialModal';
import { useAdminTours } from '../../components/tours/adminTours';
import AdminPageHeader from '@/app/admin/components/AdminPageHeader';

export default function StatisticsHeader(): React.ReactElement {
  const [modalOpen, setModalOpen] = useState(false);
  const { startStatisticsTour } = useAdminTours();

  return (
    <>
      <AdminPageHeader
        id="stats-header-section"
        title="Statistiques & Affluence"
        badge={{ icon: SignalIcon, label: 'Télémétrie en Direct' }}
        description="Analyse consolidée des présences, de la régularité et des dynamiques de pelotons du CC Saint-Martin Blanmont."
        onOpenTutorial={() => setModalOpen(true)}
      />

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
