import React from 'react';
import { getCalendarEvents } from '@/app/lib/firebase';
import { getMembers } from '@/app/lib/firebase/members';
import { getAllAttendance } from '@/app/lib/firebase/attendance';
import PointageExpressClient from './PointageExpressClient';
import PointageExpressHeader from './components/PointageExpressHeader';

export const dynamic = 'force-dynamic';

export default async function PointageExpressPage(): Promise<React.ReactElement> {
  const [events, members, allAttendance] = await Promise.all([
    getCalendarEvents(),
    getMembers(),
    getAllAttendance(),
  ]);

  // Build attendance lookup: eventId -> { memberId -> { name, group, markedAt } }
  const attendanceMap: Record<
    string,
    Record<string, { name: string; group: string; markedAt: string }>
  > = {};

  allAttendance.forEach((att) => {
    attendanceMap[att.eventId] = {};
    if (att.members) {
      Object.values(att.members).forEach((m) => {
        attendanceMap[att.eventId][m.memberId] = {
          name: m.name,
          group: m.group,
          markedAt: m.markedAt,
        };
      });
    }
  });

  // Sort events chronologically (ascending)
  const sortedEvents = [...events].sort((a, b) => a.isoDate.localeCompare(b.isoDate));

  return (
    <div className="space-y-6 pb-24">
      {/* Topographic Sheet Header */}
      <PointageExpressHeader
        eventCount={sortedEvents.length}
        memberCount={members.length}
      />

      <div className="max-w-4xl mx-auto">
        <PointageExpressClient
          initialEvents={sortedEvents}
          members={members}
          initialAttendanceMap={attendanceMap}
        />
      </div>
    </div>
  );
}
