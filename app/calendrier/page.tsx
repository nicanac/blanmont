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
        {/* Ambient red glow */}
        <div className="pointer-events-none absolute -top-40 -right-24 h-[500px] w-[500px] rounded-full bg-[#e03e3e]/15 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:px-8">
          {/* Top row: Title + Subscribe CTA */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-10 border-b border-white/10">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3.5 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-[#f5f6f8]">
                <span className="h-2 w-2 rounded-full bg-[#e03e3e] animate-pulse" />
                Saison 2026 · Planning Officiel
              </div>

              <h1 className="text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-balance">
                Calendrier des <span className="text-[#e03e3e] italic">Sorties</span>
              </h1>

              <p className="max-w-2xl text-base text-[#a7adbb] leading-relaxed">
                Toutes les sorties du samedi et dimanche, rendez-vous du peloton, traces GPS et rassemblements officiels du club.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <CalendarSubscribeButton />
            </div>
          </div>

          {/* Telemetry ribbon on Ink */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
            {/* Next ride highlight */}
            <div className="rounded-lg border border-white/15 bg-[#161922]/90 backdrop-blur-md p-5 flex items-start gap-4 shadow-xl">
              <div className="rounded-md bg-[#e03e3e]/15 border border-[#e03e3e]/30 p-2.5 text-[#e03e3e] shrink-0 mt-0.5">
                <CalendarDaysIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#e03e3e]">
                    Prochain départ
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e03e3e] animate-pulse" />
                </div>
                <div className="mt-1 text-sm font-bold text-white truncate">
                  {nextRide.dateFormatted}
                </div>
                <div className="mt-1 text-xs text-[#a7adbb] flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-3.5 w-3.5 text-[#7d8493]" />
                    <strong className="text-white font-medium">{nextRide.departure}</strong>
                  </span>
                  <span>·</span>
                  <span className="truncate">{nextRide.location}</span>
                </div>
              </div>
            </div>

            {/* Total rides count */}
            <div className="rounded-lg border border-white/15 bg-[#161922]/90 backdrop-blur-md p-5 flex items-start gap-4 shadow-xl">
              <div className="rounded-md bg-white/5 border border-white/10 p-2.5 text-[#f5f6f8] shrink-0 mt-0.5">
                <SparklesIcon className="h-5 w-5 text-[#e03e3e]" />
              </div>
              <div>
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#7d8493]">
                  Programme annuel
                </span>
                <div className="mt-1 text-sm font-bold text-white tabular-nums">
                  {totalEvents} sorties répertoriées
                </div>
                <p className="mt-1 text-xs text-[#a7adbb]">
                  Sorties route (groupes A, B, C) &amp; VTT
                </p>
              </div>
            </div>

            {/* GPX availability */}
            <div className="rounded-lg border border-white/15 bg-[#161922]/90 backdrop-blur-md p-5 flex items-start gap-4 shadow-xl">
              <div className="rounded-md bg-white/5 border border-white/10 p-2.5 text-[#f5f6f8] shrink-0 mt-0.5">
                <MapIcon className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#7d8493]">
                  Traces GPS &amp; GPX
                </span>
                <div className="mt-1 text-sm font-bold text-white tabular-nums">
                  {eventsWithGpx} parcours téléchargeables
                </div>
                <p className="mt-1 text-xs text-[#a7adbb]">
                  Compatibles Garmin, Wahoo, Strava &amp; Komoot
                </p>
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
