import React from 'react';
import Link from 'next/link';
import { PlusIcon, PencilIcon, CalendarIcon, MapPinIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { getCalendarEvents } from '@/app/lib/firebase/calendar';
import DeleteEventButton from './components/DeleteEventButton';

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage(): Promise<React.ReactElement> {
  const events = await getCalendarEvents();

  // Separate upcoming and past events
  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = events.filter((e) => e.isoDate >= today);
  const pastEvents = events.filter((e) => e.isoDate < today).slice(-10).reverse();

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('fr-BE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Événements</h1>
          <p className="text-sm text-gray-500">
            {upcomingEvents.length} événement{upcomingEvents.length !== 1 ? 's' : ''} à venir
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/events/import"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowUpTrayIcon className="h-4 w-4" />
            Importer PDF
          </Link>
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <PlusIcon className="h-4 w-4" />
            Nouvel Événement
          </Link>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Événements à venir</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {upcomingEvents.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Aucun événement à venir
            </div>
          ) : (
            upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                    <CalendarIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{formatDate(event.isoDate)}</p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{event.location}</span>
                      {event.departure && <span>• Départ: {event.departure}</span>}
                    </div>
                    {event.distances && (
                      <p className="mt-1 text-sm text-gray-500">Distances: {event.distances}</p>
                    )}
                    {event.remarks && (
                      <p className="mt-1 text-sm text-amber-600">{event.remarks}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    title="Modifier"
                  >
                    <PencilIcon className="h-4 w-4" />
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
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Événements passés (derniers 10)</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {pastEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between px-6 py-4 opacity-60 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                    <CalendarIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">{formatDate(event.isoDate)}</p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
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
