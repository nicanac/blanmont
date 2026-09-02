'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  UsersIcon,
  PlusIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import MembersTutorialModal from './MembersTutorialModal';
import { useAdminTours } from '../../components/tours/adminTours';

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
      <div id="members-header-section" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e4e0d8]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#101216] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-2">
            <UsersIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
            <span>Gestion Membres</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216]">
            Membres du Club
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5c6370]">
            {memberCount} cyclistes actifs enregistrés dans le système.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-[#e4e0d8] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] hover:bg-[#f2efe9] transition-colors shadow-xs"
            title="Ouvrir le guide de gestion des membres"
          >
            <AcademicCapIcon className="h-4 w-4 text-[#e03e3e]" />
            <span>Tutoriel &amp; Guide</span>
          </button>

          <Link
            id="members-new-btn"
            href="/admin/members/new"
            className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nouveau Membre</span>
          </Link>
        </div>
      </div>

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
