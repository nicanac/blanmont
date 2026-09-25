'use client';

import React, { useState } from 'react';
import { BoltIcon } from '@heroicons/react/24/solid';
import { TrophySquareIcon } from '@/app/components/ui/CyclingIcons';
import AdminPageHeader from '@/app/admin/components/AdminPageHeader';
import PointageExpressTutorialModal from './PointageExpressTutorialModal';

interface PointageExpressHeaderProps {
  eventCount?: number;
  memberCount?: number;
}

export default function PointageExpressHeader({
  eventCount,
  memberCount,
}: PointageExpressHeaderProps): React.ReactElement {
  const [modalOpen, setModalOpen] = useState(false);

  const legend = [
    {
      term: 'DISPOSITIF',
      value: 'Tablette & Smartphone',
      hint: 'Optimisé tactile',
    },
    {
      term: 'VALIDATION',
      value: '1-Tap & Scan QR',
      hint: 'Enregistrement direct',
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
        id="pointage-express-header"
        title="Pointage Express"
        badge={{ icon: BoltIcon, label: 'Départ Peloton' }}
        description="Émargement tactile rapide et pointage des présences au départ du samedi et dimanche matin."
        legend={legend}
        onOpenTutorial={() => setModalOpen(true)}
        tutorialLabel="Guide & Secours ICE"
        actions={[
          {
            id: 'pointage-express-carre-vert-link',
            label: 'Pointage Carré Vert',
            href: '/admin/carre-vert',
            icon: TrophySquareIcon,
            variant: 'secondary',
          },
        ]}
      />

      <PointageExpressTutorialModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
