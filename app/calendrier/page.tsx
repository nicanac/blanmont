import { getCalendarEvents } from '../lib/firebase';
import { getAllAttendance } from '../lib/firebase/attendance';
import { PageHero } from '../components/ui/PageHero';
import CalendarView from './CalendarView';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

export const revalidate = 3600; // Revalidate every hour

export default async function CalendarPage() {
    const [events, allAttendance] = await Promise.all([
        getCalendarEvents(),
        getAllAttendance(),
    ]);

    // Build attendance map: eventId -> { memberName, group }[]
    const attendanceMap: Record<string, { name: string; group: string }[]> = {};
    allAttendance.forEach((att) => {
        if (att.members) {
            attendanceMap[att.eventId] = Object.values(att.members).map((m) => ({
                name: m.name,
                group: m.group,
            }));
        }
    });

    return (
        <main className="min-h-screen bg-gray-50">
            <PageHero
                title="Calendrier"
                description="Planning des sorties et événements du club."
                badge="Événements"
                badgeIcon={<CalendarDaysIcon className="h-4 w-4" />}
                variant="green"
                size="md"
            />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 h-full">
                <CalendarView events={events} attendanceMap={attendanceMap} />
            </div>
        </main>
    );
}
