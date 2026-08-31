import React from 'react';
import StatsCharts from './components/StatsCharts';
import { getLeaderboardEntries, getCalendarEvents } from '@/app/lib/firebase';
import { getAllAttendance } from '@/app/lib/firebase/attendance';

export const dynamic = 'force-dynamic';

export default async function AdminStatisticsPage(): Promise<React.ReactElement> {
  const [entries, events, allAttendance] = await Promise.all([
    getLeaderboardEntries(),
    getCalendarEvents(),
    getAllAttendance(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
        <p className="text-sm text-gray-500">
          Données du Carré Vert - Présences et fidélité aux sorties du club
        </p>
      </div>

      {/* Client-side Charts & Stats with Year Filter */}
      <StatsCharts entries={entries} events={events} allAttendance={allAttendance} />
    </div>
  );
}

