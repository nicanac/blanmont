'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarEvent } from '@/app/types';
import { LeaderboardEntry } from '@/app/lib/firebase/leaderboard';
import { parseDateInfo } from '@/app/lib/carreVert';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import EventAttendancePanel from './EventAttendancePanel';

type AttendanceInfo = { name: string; group: string; markedAt: string };

interface CarreVertViewProps {
  events: CalendarEvent[];
  members: LeaderboardEntry[];
  attendanceMap: Record<string, Record<string, AttendanceInfo>>;
}

export default function CarreVertView({ events, members, attendanceMap }: CarreVertViewProps) {
  const router = useRouter();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'past' | 'upcoming'>('past');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const handleSyncSheet = async () => {
    if (!confirm('Voulez-vous synchroniser les présences et le classement depuis Google Sheets ?')) return;
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/admin/import-csv');
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Erreur lors de la synchronisation');
      }
      setSyncMessage(
        `Synchronisation réussie ! (${data.stats?.eventsProcessed || 0} événements, ${data.stats?.membersUpdated || 0} membres)`
      );
      router.refresh();
    } catch (err: any) {
      alert(`Erreur de synchronisation: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (filter === 'past') {
      filtered = filtered.filter((e) => e.isoDate <= today);
    } else if (filter === 'upcoming') {
      filtered = filtered.filter((e) => e.isoDate > today);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.location.toLowerCase().includes(q) ||
          e.isoDate.includes(q)
      );
    }

    return filtered;
  }, [events, filter, searchQuery, today]);

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null;

  // Format date for display
  function formatDate(isoDate: string): string {
    const info = parseDateInfo(isoDate);
    if (!info) return isoDate;
    const date = new Date(Date.UTC(info.year, info.month - 1, info.day));
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    });
  }

  function getDayOfWeek(isoDate: string): string {
    const info = parseDateInfo(isoDate);
    return info && info.isWeekend ? 'weekend' : 'weekday';
  }

  return (
    <div className="space-y-4">
      {/* Synchronization Banner / Action */}
      <div className="bg-white p-4 shadow rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-700">
            <ArrowPathIcon className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Synchronisation Google Sheets</h3>
            <p className="text-xs text-gray-500">
              Synchronise automatiquement les présences et recalcule les Carrés Verts (1/WE max + sorties semaine).
            </p>
          </div>
        </div>
        <button
          onClick={handleSyncSheet}
          disabled={syncing}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowPathIcon className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Synchronisation...' : 'Synchroniser depuis Google Sheets'}
        </button>
      </div>

      {syncMessage && (
        <div className="rounded-md bg-green-50 p-3 text-xs font-medium text-green-800 border border-green-200">
          {syncMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel: Event list */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200 space-y-3">
              <div className="flex gap-2">
                {(['past', 'upcoming', 'all'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${filter === f
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {f === 'past' ? 'Passés' : f === 'upcoming' ? 'À venir' : 'Tous'}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Rechercher un lieu ou une date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
              />
            </div>

            {/* Event List */}
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto divide-y divide-gray-100">
              {filteredEvents.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500 italic">
                  Aucun événement trouvé.
                </div>
              ) : (
                filteredEvents.map((event) => {
                  const attendeeCount = attendanceMap[event.id]
                    ? Object.keys(attendanceMap[event.id]).length
                    : 0;
                  const isPast = event.isoDate <= today;
                  const isSelected = selectedEventId === event.id;
                  const dayType = getDayOfWeek(event.isoDate);

                  return (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      className={`w-full text-left p-4 transition-colors ${isSelected
                          ? 'bg-green-50 border-l-4 border-green-600'
                          : 'hover:bg-gray-50 border-l-4 border-transparent'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${dayType === 'weekend'
                                  ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                                  : 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20'
                                }`}
                            >
                              {dayType === 'weekend' ? 'WE' : 'Sem'}
                            </span>
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {formatDate(event.isoDate)}
                            </span>
                            {!isPast && (
                              <span className="inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-blue-600/20">
                                À venir
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600 truncate">
                            {event.location}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span
                            className={`inline-flex items-center justify-center rounded-full h-8 w-8 text-xs font-bold ${attendeeCount > 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-400'
                              }`}
                          >
                            {attendeeCount}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right panel: Attendance management */}
        <div className="lg:col-span-2">
          {selectedEvent ? (
            <EventAttendancePanel
              key={selectedEvent.id}
              event={selectedEvent}
              members={members}
              initialAttendees={attendanceMap[selectedEvent.id] || {}}
            />
          ) : (
            <div className="bg-white shadow rounded-lg flex items-center justify-center h-96 text-gray-400">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                <p className="mt-2 text-sm">
                  Sélectionnez un événement pour gérer les présences
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
