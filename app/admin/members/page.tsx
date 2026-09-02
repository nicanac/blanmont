import React from 'react';
import { getMembers } from '@/app/lib/firebase/members';
import MembersTable from './components/MembersTable';
import MembersHeader from './components/MembersHeader';

export const dynamic = 'force-dynamic';

export default async function AdminMembersPage(): Promise<React.ReactElement> {
  const members = await getMembers();

  return (
    <div className="space-y-6">
      {/* Header with Tutorial & New Member Actions */}
      <MembersHeader memberCount={members.length} />

      {/* Members Table */}
      <MembersTable initialMembers={members} />
    </div>
  );
}
