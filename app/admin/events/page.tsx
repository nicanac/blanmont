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
import AdminEmptyState from '../components/AdminEmptyState';
import EventsHeader from './components/EventsHeader';

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
      {/* Header with Tutorial & PDF Import Actions */}
      <EventsHeader upcomingCount={upcomingEvents.length} />

      {/* Upcoming Events Container */}
      <div id="events-table-section" className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 overflow-hidden">
        <div className="border-b border-line dark:border-night-line px-6 py-4 bg-paper-2 dark:bg-night flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-snow-1 font-mono">
            Prochaines Sorties Programmées
          </h2>
          <span className="text-xs font-semibold text-ink-3 dark:text-snow-3 font-mono tabular-nums">
            {upcomingEvents.length} sorties
          </span>
        </div>

        <div className="divide-y divide-line/40 dark:divide-night-line">
          {upcomingEvents.length === 0 ? (
            <div className="p-6">
              <AdminEmptyState
                icon={CalendarDaysIcon}
                title="Aucune sortie officielle programmée"
                description="Le calendrier officiel permet aux membres de synchroniser les sorties sur leur smartphone, de consulter les horaires de départ et les parcours prévus."
                primaryAction={{
                  label: 'Ajouter une sortie',
                  href: '/admin/events/new',
                  icon: PlusIcon,
                }}
                secondaryAction={{
                  label: 'Importer le calendrier PDF',
                  href: '/admin/events/import',
                  icon: ArrowUpTrayIcon,
                }}
                tip="Vous pouvez importer en une seule fois l'intégralité du calendrier annuel officiel via notre extracteur de fichiers PDF."
              />
            </div>
          ) : (
            upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 sm:px-6 gap-4 hover:bg-paper-2 dark:hover:bg-night-3 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-brand/10 text-brand border border-brand/20 mt-0.5">
                    <CalendarDaysIcon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-ink dark:text-snow-1 font-semiwide">
                        {formatFrenchDate(event.isoDate)}
                      </span>
                      <span className="rounded-full bg-paper-2 dark:bg-night border border-line dark:border-night-line px-2.5 py-0.5 text-xs font-semibold text-ink-3 dark:text-snow-3 font-mono tabular-nums">
                        {event.isoDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-ink-3 dark:text-snow-3 flex-wrap">
                      <span className="inline-flex items-center gap-1 font-medium text-ink dark:text-snow-1">
                        <MapPinIcon className="h-3.5 w-3.5 text-brand" />
                        {event.location}
                      </span>
                      {event.departure && (
                        <span className="inline-flex items-center gap-1 font-mono">
                          <ClockIcon className="h-3.5 w-3.5 text-ink-3 dark:text-snow-3" />
                          Départ {event.departure}
                        </span>
                      )}
                      {event.distances && (
                        <span className="font-mono tabular-nums">• {event.distances}</span>
                      )}
                    </div>

                    {event.remarks && (
                      <p className="text-xs text-ambre-dark dark:text-ambre bg-ambre/10 border border-ambre/30 px-2 py-0.5 rounded-xs inline-block font-mono">
                        {event.remarks}
                      </p>
                    )}

                    {event.gpxUrl && (
                      <p className="text-xs text-brand truncate max-w-md font-mono">
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
                    className="inline-flex items-center gap-1 rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-3 py-1.5 text-xs font-semibold text-ink dark:text-snow-1 hover:bg-paper-3 dark:hover:bg-night-line transition-colors"
                    title="Modifier"
                  >
                    <PencilIcon className="h-3.5 w-3.5 text-ink-3 dark:text-snow-3" />
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
        <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 overflow-hidden opacity-85">
          <div className="border-b border-line dark:border-night-line px-6 py-3.5 bg-paper-2 dark:bg-night">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-mono">
              Dernières Sorties Passées
            </h2>
          </div>
          <div className="divide-y divide-line/40 dark:divide-night-line">
            {pastEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-paper-2 dark:hover:bg-night-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-ink dark:text-snow-1">
                    {formatFrenchDate(event.isoDate)}
                  </span>
                  <span className="text-xs text-ink-3 dark:text-snow-3 font-mono">• {event.location}</span>
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
