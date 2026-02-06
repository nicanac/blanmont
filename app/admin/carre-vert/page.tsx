import { getCalendarEvents, getLeaderboardEntries } from '@/app/lib/firebase';
import { getAllAttendance } from '@/app/lib/firebase/attendance';
import CarreVertView from './components/CarreVertView';

export const dynamic = 'force-dynamic';

export default async function CarreVertPage(): Promise<React.ReactElement> {
  const [events, leaderboardEntries, allAttendance] = await Promise.all([
    getCalendarEvents(),
    getLeaderboardEntries(),
    getAllAttendance(),
  ]);

  // Build a map: eventId -> { memberId -> true }
  const attendanceMap: Record<string, Record<string, { name: string; group: string; markedAt: string }>> = {};
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

  // Sort events by date descending (most recent first)
  const sortedEvents = [...events].sort((a, b) => b.isoDate.localeCompare(a.isoDate));

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carré Vert</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestion des présences aux sorties du club. Sélectionnez un événement pour marquer les membres présents.
          </p>
        </div>
      </div>

      <CarreVertView
        events={sortedEvents}
        members={leaderboardEntries}
        attendanceMap={attendanceMap}
      />
    </div>
  );
}
