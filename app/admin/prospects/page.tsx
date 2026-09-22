import React from 'react';
import { getTrialRequests } from '@/app/lib/firebase/trial-requests';
import { getMembers } from '@/app/lib/firebase/members';
import ProspectsHeader from './components/ProspectsHeader';
import ProspectsTable from './components/ProspectsTable';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Candidatures & Sorties d’essai | Administration CC Blanmont',
  description: 'Gestion et accompagnement des demandes de sorties d’essai du club.',
};

export default async function AdminProspectsPage(): Promise<React.ReactElement> {
  const [prospects, members] = await Promise.all([
    getTrialRequests(),
    getMembers(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
      <ProspectsHeader prospects={prospects} />

      {/* Main CRM Workspace Table */}
      <ProspectsTable initialProspects={prospects} captains={members} />
    </div>
  );
}
