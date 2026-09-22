import React from 'react';
import StatsCharts from './components/StatsCharts';
import {
  getLeaderboardEntries,
  getCalendarEvents,
  getTraces,
  getMembers,
  getAllFeedback,
} from '@/app/lib/firebase';
import { getAllAttendance } from '@/app/lib/firebase/attendance';
import { getAllRides, getAllVotes } from '@/app/lib/firebase/saturday-ride';
import StatisticsHeader from './components/StatisticsHeader';

export const dynamic = 'force-dynamic';

export default async function AdminStatisticsPage(): Promise<React.ReactElement> {
  const [
    entries,
    events,
    allAttendance,
    traces,
    members,
    saturdayRides,
    votes,
    feedback,
  ] = await Promise.all([
    getLeaderboardEntries().catch((err) => {
      console.warn('[AdminStatisticsPage] Failed to load leaderboard entries:', err);
      return [];
    }),
    getCalendarEvents().catch((err) => {
      console.warn('[AdminStatisticsPage] Failed to load calendar events:', err);
      return [];
    }),
    getAllAttendance().catch((err) => {
      console.warn('[AdminStatisticsPage] Failed to load attendance:', err);
      return [];
    }),
    getTraces().catch((err) => {
      console.warn('[AdminStatisticsPage] Failed to load traces:', err);
      return [];
    }),
    getMembers().catch((err) => {
      console.warn('[AdminStatisticsPage] Failed to load members:', err);
      return [];
    }),
    getAllRides().catch((err) => {
      console.warn('[AdminStatisticsPage] Failed to load saturday rides:', err);
      return [];
    }),
    getAllVotes().catch((err) => {
      console.warn('[AdminStatisticsPage] Failed to load votes:', err);
      return [];
    }),
    getAllFeedback().catch((err) => {
      console.warn('[AdminStatisticsPage] Failed to load feedback:', err);
      return [];
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header with Tutorial & Live Indicators */}
      <StatisticsHeader />

      {/* Comprehensive Client-side Analytics Dashboard */}
      <StatsCharts
        entries={entries}
        events={events}
        allAttendance={allAttendance}
        traces={traces}
        members={members}
        saturdayRides={saturdayRides}
        votes={votes}
        feedback={feedback}
      />
    </div>
  );
}
