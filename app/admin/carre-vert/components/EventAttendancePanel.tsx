'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarEvent } from '@/app/types';
import { LeaderboardEntry } from '@/app/lib/firebase/leaderboard';

type AttendanceInfo = { name: string; group: string; markedAt: string };

interface EventAttendancePanelProps {
  event: CalendarEvent;
  members: LeaderboardEntry[];
  initialAttendees: Record<string, AttendanceInfo>;
}

export default function EventAttendancePanel({
  event,
  members,
  initialAttendees,
}: EventAttendancePanelProps) {
  const router = useRouter();
  const [attendees, setAttendees] = useState<Record<string, AttendanceInfo>>(initialAttendees);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');

  // Get unique groups from members
  const groups = useMemo(() => {
    const g = new Set(members.map((m) => m.group));
    return Array.from(g).sort();
  }, [members]);

  // Filter members
  const filteredMembers = useMemo(() => {
    let filtered = members;

    if (groupFilter !== 'all') {
      filtered = filtered.filter((m) => m.group === groupFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((m) => m.name.toLowerCase().includes(q));
    }

    // Sort: present members first, then alphabetical
    return [...filtered].sort((a, b) => {
      const aPresent = !!attendees[a.id];
      const bPresent = !!attendees[b.id];
      if (aPresent !== bPresent) return aPresent ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [members, groupFilter, searchQuery, attendees]);

  const presentCount = Object.keys(attendees).length;

  // Format date
  const dateObj = new Date(event.isoDate);
  const dateStr = dateObj.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isPast = event.isoDate <= new Date().toISOString().split('T')[0];

  const toggleAttendance = useCallback(
    async (member: LeaderboardEntry) => {
      const memberId = member.id;
      const isPresent = !!attendees[memberId];
      const action = isPresent ? 'remove' : 'add';

      setLoading((prev) => ({ ...prev, [memberId]: true }));

      try {
        const res = await fetch('/api/admin/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: event.id,
            isoDate: event.isoDate,
            memberId,
            name: member.name,
            group: member.group,
            action,
          }),
        });

        if (!res.ok) throw new Error('Failed to update attendance');

        setAttendees((prev) => {
          if (action === 'add') {
            return {
              ...prev,
              [memberId]: {
                name: member.name,
                group: member.group,
                markedAt: new Date().toISOString(),
              },
            };
          } else {
            const next = { ...prev };
            delete next[memberId];
            return next;
          }
        });

        // Refresh server data in background
        router.refresh();
      } catch (error) {
        console.error('Failed to toggle attendance:', error);
        alert('Erreur lors de la mise à jour de la présence.');
      } finally {
        setLoading((prev) => ({ ...prev, [memberId]: false }));
      }
    },
    [attendees, event, router]
  );

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Event Header */}
      <div className={`p-6 ${isPast ? 'bg-green-600' : 'bg-blue-600'} text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{event.location}</h2>
            <p className="mt-1 text-sm opacity-90 capitalize">{dateStr}</p>
            {event.distances && (
              <p className="mt-1 text-sm opacity-75">{event.distances} km · Départ {event.departure}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{presentCount}</div>
            <div className="text-sm opacity-90">présent{presentCount !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <input
          type="text"
          placeholder="Rechercher un membre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
        />
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setGroupFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              groupFilter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tous ({members.length})
          </button>
          {groups.map((g) => (
            <button
              key={g}
              onClick={() => setGroupFilter(g)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                groupFilter === g
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {g} ({members.filter((m) => m.group === g).length})
            </button>
          ))}
        </div>
      </div>

      {/* Members List */}
      <div className="max-h-[calc(100vh-480px)] overflow-y-auto divide-y divide-gray-100">
        {filteredMembers.map((member) => {
          const isPresent = !!attendees[member.id];
          const isLoading = !!loading[member.id];

          return (
            <div
              key={member.id}
              className={`flex items-center justify-between p-4 transition-colors ${
                isPresent ? 'bg-green-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Checkbox */}
                <button
                  onClick={() => toggleAttendance(member)}
                  disabled={isLoading}
                  className={`flex-shrink-0 h-6 w-6 rounded border-2 flex items-center justify-center transition-colors ${
                    isLoading
                      ? 'border-gray-300 bg-gray-100 cursor-wait'
                      : isPresent
                      ? 'border-green-600 bg-green-600 hover:bg-green-700 cursor-pointer'
                      : 'border-gray-300 hover:border-green-500 cursor-pointer'
                  }`}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-3 w-3 text-gray-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : isPresent ? (
                    <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : null}
                </button>

                {/* Name and group */}
                <div className="min-w-0">
                  <p className={`text-sm truncate ${isPresent ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                    {member.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                    member.group.startsWith('A')
                      ? 'bg-red-50 text-red-700 ring-red-600/10'
                      : member.group.startsWith('B')
                      ? 'bg-blue-50 text-blue-700 ring-blue-600/10'
                      : member.group.startsWith('C')
                      ? 'bg-green-50 text-green-700 ring-green-600/10'
                      : 'bg-gray-50 text-gray-600 ring-gray-500/10'
                  }`}
                >
                  {member.group}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
