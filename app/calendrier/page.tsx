import { getCalendarEvents, getNextScheduledRide } from '../lib/firebase/calendar';
import { getAllAttendance } from '../lib/firebase/attendance';
import CalendarView from './CalendarView';
import CalendarSubscribeButton from './CalendarSubscribeButton';
import {
  CalendarDaysIcon,
  MapPinIcon,
  ClockIcon,
  MapIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export const revalidate = 3600; // Revalidate every hour

export default async function CalendarPage() {
  const [events, allAttendance] = await Promise.all([
    getCalendarEvents(),
    getAllAttendance(),
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
    <main className="min-h-screen bg-[#faf8f5]">
      {/* ──── Editorial Cover Hero (Ink) ──── */}
      <section className="relative overflow-hidden bg-[#0a0c10] text-white border-b border-[#262b38]">
        {/* Atmospheric Background Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.025] leading-none text-center">
          <span className="text-[clamp(6rem,22vw,28rem)] font-extrabold uppercase tracking-tighter text-white whitespace-nowrap">
            BLANMONT
          </span>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:px-8 z-10">
          {/* Top row: Title + Subscribe CTA */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-8 border-b border-white/10">
            <div className="space-y-3 max-w-3xl">
              <h1 className="text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-balance">
                Calendrier des <span className="text-[#e03e3e] italic">Sorties</span>
              </h1>

              <p className="max-w-2xl text-base text-[#a7adbb] leading-relaxed">
                Toutes les sorties du samedi et dimanche, rendez-vous du peloton, traces GPS et rassemblements officiels du club pour la saison 2026.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <CalendarSubscribeButton />
            </div>
          </div>

          {/* Stat Strip on Ink (Horizontal Hairline Structure) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 pt-6">
            {/* Next ride highlight */}
            <div className="py-3 sm:py-0 sm:px-6 first:sm:pl-0 flex items-center gap-4">
              <div className="rounded-md bg-[#e03e3e]/15 border border-[#e03e3e]/30 p-2.5 text-[#e03e3e] shrink-0">
                <CalendarDaysIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate">
                    {nextRide.dateFormatted}
                  </div>
                  <span className="h-2 w-2 rounded-full bg-[#e03e3e] animate-pulse shrink-0" />
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#a7adbb] font-semibold truncate tabular-nums">
                  Départ {nextRide.departure} · {nextRide.location}
                </div>
              </div>
            </div>

            {/* Total rides count */}
            <div className="py-3 sm:py-0 sm:px-6 flex items-center gap-4">
              <div className="rounded-md bg-white/5 border border-white/10 p-2.5 text-[#f5f6f8] shrink-0">
                <SparklesIcon className="h-5 w-5 text-[#e03e3e]" aria-hidden="true" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
                  {totalEvents}
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#a7adbb] font-semibold">
                  Sorties au programme
                </div>
              </div>
            </div>

            {/* GPX availability */}
            <div className="py-3 sm:py-0 sm:px-6 last:sm:pr-0 flex items-center gap-4">
              <div className="rounded-md bg-white/5 border border-white/10 p-2.5 text-[#f5f6f8] shrink-0">
                <MapIcon className="h-5 w-5 text-[#3b82f6]" aria-hidden="true" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
                  {eventsWithGpx}
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#a7adbb] font-semibold">
                  Parcours GPX téléchargeables
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Calendar Grid & Agenda Spread (Paper) ──── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <CalendarView events={events} attendanceMap={attendanceMap} />
      </section>
    </main>
  );
}
