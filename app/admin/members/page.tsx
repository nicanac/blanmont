import React from 'react';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import { getMembers } from '@/app/lib/firebase/members';
import MembersTable from './components/MembersTable';

export const dynamic = 'force-dynamic';

export default async function AdminMembersPage(): Promise<React.ReactElement> {
  const members = await getMembers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Membres</h1>
          <p className="text-sm text-gray-500">{members.length} membres enregistrés</p>
        </div>
        <Link
          href="/admin/members/new"
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          <PlusIcon className="h-4 w-4" />
          Nouveau Membre
        </Link>
      </div>

      {/* Members Table */}
      <MembersTable initialMembers={members} />
    </div>
  );
}
