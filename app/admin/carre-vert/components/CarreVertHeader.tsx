'use client';

import React, { useState } from 'react';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import SyncCarreVertButton from './SyncCarreVertButton';
import CarreVertTutorialModal from './CarreVertTutorialModal';
import { useAdminTours } from '../../components/tours/adminTours';
import AdminPageHeader from '@/app/admin/components/AdminPageHeader';

export default function CarreVertHeader(): React.ReactElement {
  const [modalOpen, setModalOpen] = useState(false);
  const { startCarreVertTour } = useAdminTours();

  return (
    <>
      <AdminPageHeader
        id="carre-vert-header"
        title="Carré Vert"
        badge={{ icon: CheckBadgeIcon, label: "Challenge d'Assiduité" }}
        description="Gestion, pointage des présences et synchronisation Google Sheets pour le classement officiel."
        onOpenTutorial={() => setModalOpen(true)}
        actions={[
          {
            label: '📱 Pointage Express Mobile',
            href: '/admin/pointage-express',
            variant: 'primary',
          },
        ]}
        rightExtra={
          <div id="carre-vert-sync-btn">
            <SyncCarreVertButton />
          </div>
        }
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
