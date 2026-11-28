import { Suspense } from 'react';
import { getCalendarEvents, getNextScheduledRide } from '../lib/firebase/calendar';
import { getAllAttendance } from '../lib/firebase/attendance';
import { getAllEventReviews } from '../lib/firebase/event-reviews';
import CalendarView from './CalendarView';
import CalendarSubscribeButton from './CalendarSubscribeButton';
import { Spinner } from '../components/ui/Spinner';
import { withMemberTraceLinks } from '../lib/member-trace';
import { hasRideTrace } from '../lib/ride-traces';
import { SheetHeader } from '../components/carte/SheetHeader';

// Admin edits refresh the page at once (revalidateCalendarPages); this only bounds edits made
// outside the app (Firebase console).
export const revalidate = 300;

export default async function CalendarPage() {
  const [rawEvents, allAttendance, allReviews] = await Promise.all([
    getCalendarEvents(),
    getAllAttendance(),
    getAllEventReviews(),
  ]);

  // Traces are for members: the page only carries their member links (#252).
  const events = withMemberTraceLinks(rawEvents);

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
  const eventsWithGpx = events.filter((e) => hasRideTrace(e)).length;

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
