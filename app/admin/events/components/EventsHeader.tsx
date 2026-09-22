'use client';

import React, { useState } from 'react';
import {
  CalendarDaysIcon,
  PlusIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import EventsTutorialModal from './EventsTutorialModal';
import { useAdminTours } from '../../components/tours/adminTours';
import AdminPageHeader from '@/app/admin/components/AdminPageHeader';

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
      <AdminPageHeader
        id="events-header-section"
        title="Événements & Sorties"
        badge={{ icon: CalendarDaysIcon, label: 'Planning Officiel' }}
        description={`${upcomingCount} sortie${upcomingCount !== 1 ? 's' : ''} à venir au calendrier.`}
        onOpenTutorial={() => setModalOpen(true)}
        actions={[
          {
            id: 'events-import-pdf-btn',
            label: 'Importer PDF',
            href: '/admin/events/import',
            icon: ArrowUpTrayIcon,
            variant: 'secondary',
          },
          {
            id: 'events-new-btn',
            label: 'Nouvelle Sortie',
            href: '/admin/events/new',
            icon: PlusIcon,
            variant: 'primary',
          },
        ]}
      />

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
