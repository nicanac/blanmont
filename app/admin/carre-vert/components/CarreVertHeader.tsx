'use client';

import React, { useState } from 'react';
import { CheckBadgeIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import SyncCarreVertButton from './SyncCarreVertButton';
import CarreVertTutorialModal from './CarreVertTutorialModal';
import { useAdminTours } from '../../components/tours/adminTours';
import AdminPageHeader from '@/app/admin/components/AdminPageHeader';

interface CarreVertHeaderProps {
  eventCount?: number;
  memberCount?: number;
}

export default function CarreVertHeader({
  eventCount,
  memberCount,
}: CarreVertHeaderProps): React.ReactElement {
  const [modalOpen, setModalOpen] = useState(false);
  const { startCarreVertTour } = useAdminTours();

  const legend = [
    {
      term: 'DISPOSITIF',
      value: 'Challenge Club 2026',
      hint: '1 pt / sortie (max 1 / WE)',
    },
    {
      term: 'SYNCHRONISATION',
      value: 'Google Sheets & Cron',
      hint: 'Mise à jour automatique',
    },
    ...(memberCount !== undefined && eventCount !== undefined
      ? [
          {
            term: 'EFFECTIFS',
            value: `${memberCount} membres`,
            hint: `${eventCount} sorties au calendrier`,
          },
        ]
      : []),
  ];

  return (
    <>
      <AdminPageHeader
        id="carre-vert-header"
        title="Carré Vert"
        badge={{ icon: CheckBadgeIcon, label: "Challenge d'Assiduité" }}
        description="Gestion des présences aux sorties officielles et synchronisation continue du classement."
        legend={legend}
        onOpenTutorial={() => setModalOpen(true)}
        tutorialLabel="Guide & Règles"
        rightExtra={<SyncCarreVertButton />}
        actions={[
          {
            id: 'carre-vert-express-link',
            label: 'Pointage Express Mobile',
            href: '/admin/pointage-express',
            icon: DevicePhoneMobileIcon,
            variant: 'secondary',
            tooltip: 'Embarquement tactile rapide au départ du peloton',
            badge: 'Départ',
          },
        ]}
      />

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
