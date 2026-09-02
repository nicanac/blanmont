import React from 'react';
import Link from 'next/link';
import { PlusIcon, UsersIcon } from '@heroicons/react/24/outline';
import { getMembers } from '@/app/lib/firebase/members';
import MembersTable from './components/MembersTable';

export const dynamic = 'force-dynamic';

export default async function AdminMembersPage(): Promise<React.ReactElement> {
  const members = await getMembers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e4e0d8]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#101216] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-2">
            <UsersIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
            <span>Gestion Membres</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216]">
            Membres du Club
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5c6370]">
            {members.length} membres actifs enregistrés dans le système.
          </p>
        </div>
        <Link
          href="/admin/members/new"
          className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs shrink-0"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Nouveau Membre</span>
        </Link>
      </div>

      {/* Members Table */}
      <MembersTable initialMembers={members} />
    </div>
  );
}
