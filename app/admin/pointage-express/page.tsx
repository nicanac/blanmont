import React from 'react';
import { getCalendarEvents } from '@/app/lib/firebase';
import { getMembers } from '@/app/lib/firebase/members';
import { getAllAttendance } from '@/app/lib/firebase/attendance';
import PointageExpressClient from './PointageExpressClient';

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

  // Sort events by date: closest upcoming/recent first
  const sortedEvents = [...events].sort((a, b) => b.isoDate.localeCompare(a.isoDate));

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <PointageExpressClient
        initialEvents={sortedEvents}
        members={members}
        initialAttendanceMap={attendanceMap}
      />
    </div>
  );
}
