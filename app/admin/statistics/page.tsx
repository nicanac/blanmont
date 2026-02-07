import React from 'react';
import StatsCharts from './components/StatsCharts';
import { getLeaderboardEntries } from '@/app/lib/firebase/leaderboard';

export const dynamic = 'force-dynamic';

export default async function AdminStatisticsPage(): Promise<React.ReactElement> {
  const entries = await getLeaderboardEntries();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
        <p className="text-sm text-gray-500">
          Données du Carré Vert - Présence aux sorties du samedi
        </p>
      </div>

      {/* Client-side Charts & Stats with Year Filter */}
      <StatsCharts entries={entries} />
    </div>
  );
}
