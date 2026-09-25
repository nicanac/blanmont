'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarEvent } from '@/app/types';
import { LeaderboardEntry } from '@/app/lib/firebase/leaderboard';
import { parseDateInfo } from '@/app/lib/carreVert';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import EventAttendancePanel from './EventAttendancePanel';
import { toast } from 'sonner';

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
      toast.success(
        `Synchronisation réussie (${data.stats?.eventsProcessed || 0} événements, ${data.stats?.membersUpdated || 0} membres)`
      );
      router.refresh();
    } catch (err: any) {
      toast.error(`Erreur de synchronisation: ${err.message}`);
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
      <div className="bg-paper dark:bg-night-2 p-4 rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-line dark:border-night-line">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-bois/40 dark:bg-vert/20 flex items-center justify-center text-vert dark:text-bois border border-vert/20">
            <ArrowPathIcon className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink dark:text-snow-1">Synchronisation Google Sheets</h3>
            <p className="text-xs text-ink-3 dark:text-snow-3">
              Synchronise automatiquement les présences et recalcule les Carrés Verts (1/WE max + sorties semaine).
            </p>
          </div>
        </div>
        <button
          onClick={handleSyncSheet}
          disabled={syncing}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-vert px-3.5 py-2 text-xs font-semibold text-white hover:bg-vert/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vert disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer min-h-[44px]"
        >
          <ArrowPathIcon className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Synchronisation...' : 'Synchroniser depuis Google Sheets'}
        </button>
      </div>

      {syncMessage && (
        <div className="rounded-md bg-bois/30 dark:bg-vert/20 p-3 text-xs font-medium text-vert dark:text-bois border border-vert/30">
          {syncMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel: Event list */}
        <div id="carre-vert-events-list" className="lg:col-span-1">
          <div className="bg-paper dark:bg-night-2 rounded-md overflow-hidden border border-line dark:border-night-line">
            {/* Filters */}
            <div className="p-4 border-b border-line dark:border-night-line space-y-3">
              <div className="flex gap-2">
                {(['past', 'upcoming', 'all'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors duration-150 min-h-[32px] cursor-pointer ${
                      filter === f
                        ? 'bg-vert text-white'
                        : 'bg-paper-2 dark:bg-night-3 text-ink-2 dark:text-snow-3 hover:bg-line dark:hover:bg-night-line'
                    }`}
                  >
                    {f === 'past' ? 'Passés' : f === 'upcoming' ? 'À venir' : 'Tous'}
                  </button>
                ))}
              </div>
              <input
                id="carre-vert-event-search"
                type="text"
                aria-label="Rechercher un lieu ou une date"
                placeholder="Rechercher un lieu ou une date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-3 text-ink dark:text-snow-1 px-3 py-2 text-sm placeholder-ink-3 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-hidden transition-colors duration-150"
              />
            </div>

            {/* Event List */}
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto divide-y divide-line dark:divide-night-line">
              {filteredEvents.length === 0 ? (
                <div className="p-8 text-center text-sm text-ink-3 dark:text-snow-3 italic">
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
                      className={`w-full text-left p-4 rounded-md transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-bois/30 dark:bg-vert/10 ring-1 ring-vert/40 font-semibold'
                          : 'hover:bg-paper-2 dark:hover:bg-night-3'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold ${
                                dayType === 'weekend'
                                  ? 'bg-bois/40 dark:bg-vert/20 text-vert dark:text-bois ring-1 ring-vert/30'
                                  : 'bg-ambre/10 dark:bg-ambre/20 text-ambre ring-1 ring-ambre/30'
                              }`}
                            >
                              {dayType === 'weekend' ? 'WE' : 'Sem'}
                            </span>
                            <span className="text-sm font-medium text-ink dark:text-snow-1 truncate">
                              {formatDate(event.isoDate)}
                            </span>
                            {!isPast && (
                              <span className="inline-flex items-center rounded-full bg-hydro/10 dark:bg-hydro/20 px-2 py-0.5 text-xs font-semibold text-hydro ring-1 ring-hydro/30">
                                À venir
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-ink-3 dark:text-snow-3 truncate">
                            {event.location}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span
                            className={`inline-flex items-center justify-center rounded-full h-8 w-8 md:h-8 md:w-8 text-xs font-bold tabular-nums ${
                              attendeeCount > 0
                                ? 'bg-bois/50 dark:bg-vert/30 text-vert dark:text-bois ring-1 ring-vert/30'
                                : 'bg-paper-2 dark:bg-night-3 text-ink-3 dark:text-snow-3'
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
        <div id="carre-vert-attendance-panel" className="lg:col-span-2">
          {selectedEvent ? (
            <EventAttendancePanel
              key={selectedEvent.id}
              event={selectedEvent}
              members={members}
              initialAttendees={attendanceMap[selectedEvent.id] || {}}
            />
          ) : (
            <div className="bg-paper dark:bg-night-2 rounded-md flex items-center justify-center h-96 text-ink-3 dark:text-snow-3 border border-line dark:border-night-line">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-line dark:text-ink-2"
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
