import { Suspense } from 'react';
import { getCalendarEvents, getNextScheduledRide } from '../lib/firebase/calendar';
import { getAllAttendance } from '../lib/firebase/attendance';
import { getAllEventReviews } from '../lib/firebase/event-reviews';
import CalendarView from './CalendarView';
import CalendarSubscribeButton from './CalendarSubscribeButton';
import { Spinner } from '../components/ui/Spinner';
import { SheetHeader } from '../components/carte/SheetHeader';

export const revalidate = 3600; // Revalidate every hour

export default async function CalendarPage() {
  const [events, allAttendance, allReviews] = await Promise.all([
    getCalendarEvents(),
    getAllAttendance(),
    getAllEventReviews(),
  ]);

  // Build attendance map: eventId -> { name, group }[]
  const attendanceMap: Record<string, { name: string; group: string }[]> = {};
  allAttendance.forEach((att) => {
    if (att.members) {
      attendanceMap[att.eventId] = Object.values(att.members).map((m) => ({
        name: m.name,
        group: m.group,
      }));
    }
  });

  const nextRide = getNextScheduledRide(events);
  const totalEvents = events.length;
  const eventsWithGpx = events.filter((e) => !!e.gpxUrl).length;

  return (
    <main className="min-h-screen bg-paper text-ink transition-colors duration-200 dark:bg-night dark:text-snow">
      <SheetHeader
        sheet="Calendrier"
        focus={{ x: 58, y: 66 }}
        title="Calendrier des sorties"
        description="Programme officiel des sorties route et VTT de la saison. Horaires de départ, traces GPX à télécharger et débriefings du peloton."
        legend={[
          {
            term: 'Prochaine sortie',
            value: nextRide.dateFormatted,
            hint: `Départ ${nextRide.departure} · ${nextRide.location}`,
          },
          { term: 'Sorties au programme', value: `${totalEvents} sorties` },
          { term: 'Traces GPX', value: `${eventsWithGpx} disponibles` },
        ]}
        actions={<CalendarSubscribeButton />}
      />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20 text-center">
              <Spinner size="md" />
            </div>
          }
        >
          <CalendarView
            events={events}
            attendanceMap={attendanceMap}
            initialReviewsMap={allReviews}
          />
        </Suspense>
      </section>
    </main>
  );
}
