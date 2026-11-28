import React from 'react';
import { getCalendarEvents } from '@/app/lib/firebase';
import { getMembers } from '@/app/lib/firebase/members';
import { getAllAttendance } from '@/app/lib/firebase/attendance';
import { pollRespondentsByEvent } from '@/app/lib/poll-attendance-loader';
import { prefilledMemberIds } from '@/app/lib/poll-attendance';
import { getTodayIso } from '@/app/utils/date';
import PointageExpressClient from './PointageExpressClient';
import PointageExpressHeader from './components/PointageExpressHeader';

export const dynamic = 'force-dynamic';

export default async function PointageExpressPage(): Promise<React.ReactElement> {
  const [events, members, allAttendance] = await Promise.all([
    getCalendarEvents(),
    getMembers(),
    getAllAttendance(),
  ]);
  // Weekend poll answers of the rides around today: their respondents start ticked on the ride's day.
  const pollRespondents = await pollRespondentsByEvent(events, getTodayIso()).catch((error) => {
    console.error('Poll respondents not loaded for Pointage Express:', error);
    return {};
  });

  // Build attendance lookup: eventId -> { memberId -> { name, group, markedAt } }
  const attendanceMap: Record<
    string,
    Record<string, { name: string; group: string; markedAt: string }>
  > = {};

  // Members the poll already pre-checked, per ride (a ride listed here is never pre-checked again automatically).
  const pollPrefilled: Record<string, string[]> = {};

  allAttendance.forEach((att) => {
    if (att.pollPrefill) pollPrefilled[att.eventId] = prefilledMemberIds(att.pollPrefill);
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
          pollRespondents={pollRespondents}
          initialPollPrefilled={pollPrefilled}
        />
      </div>
    </div>
  );
}
