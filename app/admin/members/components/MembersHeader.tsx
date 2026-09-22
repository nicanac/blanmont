'use client';

import React, { useState } from 'react';
import {
  UsersIcon,
  PlusIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import MembersTutorialModal from './MembersTutorialModal';
import { useAdminTours } from '../../components/tours/adminTours';
import AdminPageHeader from '@/app/admin/components/AdminPageHeader';

interface MembersHeaderProps {
  memberCount: number;
}

export default function MembersHeader({
  memberCount,
}: MembersHeaderProps): React.ReactElement {
  const [modalOpen, setModalOpen] = useState(false);
  const { startMembersTour } = useAdminTours();

  return (
    <>
      <AdminPageHeader
        id="members-header-section"
        title="Membres du Club"
        badge={{ icon: UsersIcon, label: 'Gestion Membres' }}
        description={`${memberCount} cyclistes actifs enregistrés dans le système.`}
        onOpenTutorial={() => setModalOpen(true)}
        actions={[
          {
            label: 'Portraits & Cadrage',
            href: '/admin/members/photos',
            icon: UserCircleIcon,
            variant: 'secondary',
          },
          {
            id: 'members-new-btn',
            label: 'Nouveau Membre',
            href: '/admin/members/new',
            icon: PlusIcon,
            variant: 'primary',
          },
        ]}
      />

      <MembersTutorialModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onStartTour={() => {
          setTimeout(() => {
            startMembersTour();
          }, 200);
        }}
      />
    </>
  );
}
