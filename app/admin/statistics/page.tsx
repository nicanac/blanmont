import React from 'react';
import StatsCharts from './components/StatsCharts';
import { getLeaderboardEntries, getCalendarEvents } from '@/app/lib/firebase';
import { getAllAttendance } from '@/app/lib/firebase/attendance';
import StatisticsHeader from './components/StatisticsHeader';

export const dynamic = 'force-dynamic';

export default async function AdminStatisticsPage(): Promise<React.ReactElement> {
  const [entries, events, allAttendance] = await Promise.all([
    getLeaderboardEntries(),
    getCalendarEvents(),
    getAllAttendance(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header with Tutorial & Guide */}
      <StatisticsHeader />

      {/* Client-side Charts & Stats with Year Filter */}
      <StatsCharts entries={entries} events={events} allAttendance={allAttendance} />
    </div>
  );
}

