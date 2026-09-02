import React from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  PencilIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ArrowUpTrayIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { getCalendarEvents } from '@/app/lib/firebase/calendar';
import DeleteEventButton from './components/DeleteEventButton';
import { formatFrenchDate, getTodayIso } from '@/app/utils/date';

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage(): Promise<React.ReactElement> {
  const events = await getCalendarEvents();

  const today = getTodayIso();
  const upcomingEvents = events.filter((e) => e.isoDate >= today);
  const pastEvents = events
    .filter((e) => e.isoDate < today)
    .slice(-10)
    .reverse();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e4e0d8]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#101216] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-2">
            <CalendarDaysIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
            <span>Planning Officiel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216]">
            Événements &amp; Sorties
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5c6370]">
            {upcomingEvents.length} sortie{upcomingEvents.length !== 1 ? 's' : ''} à venir au calendrier.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/events/import"
            className="inline-flex items-center gap-2 rounded-md border border-[#e4e0d8] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] hover:bg-[#f2efe9] transition-colors"
          >
            <ArrowUpTrayIcon className="h-4 w-4 text-[#7d8493]" />
            <span>Importer PDF</span>
          </Link>
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nouvelle Sortie</span>
          </Link>
        </div>
      </div>

      {/* Upcoming Events Container */}
      <div className="rounded-lg border border-[#e4e0d8] bg-white shadow-xs overflow-hidden">
        <div className="border-b border-[#e4e0d8] px-6 py-4 bg-[#f2efe9] flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#101216]">
            Prochaines Sorties Programmées
          </h2>
          <span className="text-xs font-semibold text-[#7d8493] tabular-nums">
            {upcomingEvents.length} sorties
          </span>
        </div>

        <div className="divide-y divide-[#efece5]">
          {upcomingEvents.length === 0 ? (
            <div className="px-6 py-12 text-center text-xs text-[#7d8493]">
              Aucun événement à venir. Cliquez sur &laquo; Nouvelle Sortie &raquo; pour en ajouter.
            </div>
          ) : (
            upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 sm:px-6 gap-4 hover:bg-[#faf8f5] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#e03e3e]/10 text-[#e03e3e] border border-[#e03e3e]/20 mt-0.5">
                    <CalendarDaysIcon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#101216]">
                        {formatFrenchDate(event.isoDate)}
                      </span>
                      <span className="rounded-full bg-white border border-[#e4e0d8] px-2.5 py-0.5 text-xs font-semibold text-[#5c6370] tabular-nums">
                        {event.isoDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#5c6370] flex-wrap">
                      <span className="inline-flex items-center gap-1 font-medium text-[#101216]">
                        <MapPinIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
                        {event.location}
                      </span>
                      {event.departure && (
                        <span className="inline-flex items-center gap-1">
                          <ClockIcon className="h-3.5 w-3.5 text-[#7d8493]" />
                          Départ {event.departure}
                        </span>
                      )}
                      {event.distances && (
                        <span>• {event.distances}</span>
                      )}
                    </div>

                    {event.remarks && (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-sm inline-block">
                        {event.remarks}
                      </p>
                    )}

                    {event.gpxUrl && (
                      <p className="text-xs text-[#e03e3e] truncate max-w-md">
                        <span className="font-semibold">Trace GPS :</span>{' '}
                        <a
                          href={event.gpxUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {event.gpxUrl}
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="inline-flex items-center gap-1 rounded-md border border-[#e4e0d8] bg-white px-3 py-1.5 text-xs font-semibold text-[#101216] hover:bg-[#f2efe9] transition-colors"
                    title="Modifier"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                    <span>Modifier</span>
                  </Link>
                  <DeleteEventButton eventId={event.id} eventDate={event.isoDate} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div className="rounded-lg border border-[#e4e0d8] bg-white shadow-xs overflow-hidden opacity-80">
          <div className="border-b border-[#e4e0d8] px-6 py-3.5 bg-[#f2efe9]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#7d8493]">
              Dernières Sorties Passées
            </h2>
          </div>
          <div className="divide-y divide-[#efece5]">
            {pastEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-[#faf8f5]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[#101216]">
                    {formatFrenchDate(event.isoDate)}
                  </span>
                  <span className="text-xs text-[#7d8493]">• {event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DeleteEventButton eventId={event.id} eventDate={event.isoDate} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
