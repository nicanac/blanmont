'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarEvent } from '@/app/types';
import { LeaderboardEntry } from '@/app/lib/firebase/leaderboard';
import { toast } from 'sonner';
import { parseDateInfo } from '@/app/lib/carreVert';

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
  const dateInfo = parseDateInfo(event.isoDate);
  let dateStr = event.isoDate;
  if (dateInfo) {
    const utcDate = new Date(Date.UTC(dateInfo.year, dateInfo.month - 1, dateInfo.day));
    dateStr = utcDate.toLocaleDateString('fr-FR', {
      timeZone: 'UTC',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

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

        toast.success(
          action === 'add'
            ? `${member.name} marqué présent !`
            : `${member.name} retiré des présences.`
        );

        // Refresh server data in background
        router.refresh();
      } catch (error) {
        console.error('Failed to toggle attendance:', error);
        toast.error('Erreur lors de la mise à jour de la présence.');
      } finally {
        setLoading((prev) => ({ ...prev, [memberId]: false }));
      }
    },
    [attendees, event, router]
  );

  return (
    <div className="bg-white dark:bg-[#161922] shadow-xs rounded-lg overflow-hidden border border-[#e4e0d8] dark:border-[#262b38]">
      {/* Event Header */}
      <div className={`p-6 ${isPast ? 'bg-emerald-700 dark:bg-emerald-900' : 'bg-[#101216] dark:bg-[#0a0c10] border-b border-[#e4e0d8] dark:border-[#262b38]'} text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{event.location}</h2>
            <p className="mt-1 text-sm opacity-90 capitalize">{dateStr}</p>
            {event.distances && (
              <p className="mt-1 text-sm opacity-75">{event.distances} km · Départ {event.departure}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold tabular-nums">{presentCount}</div>
            <div className="text-sm opacity-90">présent{presentCount !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-[#e4e0d8] dark:border-[#262b38] space-y-3">
        <input
          id="attendance-member-search"
          type="text"
          aria-label="Rechercher un membre"
          placeholder="Rechercher un membre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] text-[#101216] dark:text-white px-3 py-2 text-sm placeholder-[#a7adbb] focus:border-[#e03e3e] focus:ring-1 focus:ring-[#e03e3e] focus:outline-hidden transition-colors duration-150"
        />
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setGroupFilter('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors duration-150 min-h-[32px] cursor-pointer ${
              groupFilter === 'all'
                ? 'bg-[#101216] dark:bg-white text-white dark:text-[#101216]'
                : 'bg-[#f2efe9] dark:bg-[#1d2128] text-[#3a3f4a] dark:text-[#a7adbb] hover:bg-[#e4e0d8] dark:hover:bg-[#262b38]'
            }`}
          >
            Tous ({members.length})
          </button>
          {groups.map((g) => (
            <button
              key={g}
              onClick={() => setGroupFilter(g)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors duration-150 min-h-[32px] cursor-pointer ${
                groupFilter === g
                  ? 'bg-[#101216] dark:bg-white text-white dark:text-[#101216]'
                  : 'bg-[#f2efe9] dark:bg-[#1d2128] text-[#3a3f4a] dark:text-[#a7adbb] hover:bg-[#e4e0d8] dark:hover:bg-[#262b38]'
              }`}
            >
              {g} ({members.filter((m) => m.group === g).length})
            </button>
          ))}
        </div>
      </div>

      {/* Members List */}
      <div className="max-h-[calc(100vh-480px)] overflow-y-auto divide-y divide-[#e4e0d8] dark:divide-[#262b38]">
        {filteredMembers.map((member) => {
          const isPresent = !!attendees[member.id];
          const isLoading = !!loading[member.id];

          return (
            <div
              key={member.id}
              className={`flex items-center justify-between p-4 transition-colors duration-150 ${
                isPresent ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : 'hover:bg-[#faf8f5] dark:hover:bg-[#1d2128]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Checkbox */}
                <button
                  onClick={() => toggleAttendance(member)}
                  disabled={isLoading}
                  className={`flex-shrink-0 h-6 w-6 md:h-6 md:w-6 rounded-md border flex items-center justify-center transition-colors duration-150 ${
                    isLoading
                      ? 'border-[#e4e0d8] dark:border-[#262b38] bg-[#f2efe9] dark:bg-[#1d2128] cursor-wait'
                      : isPresent
                      ? 'border-emerald-600 bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                      : 'border-[#e4e0d8] dark:border-[#262b38] hover:border-emerald-500 cursor-pointer'
                  }`}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-3 w-3 text-[#a7adbb]" viewBox="0 0 24 24">
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
                  <p className={`text-sm truncate ${isPresent ? 'font-bold text-[#101216] dark:text-white' : 'font-medium text-[#3a3f4a] dark:text-[#d1d5db]'}`}>
                    {member.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                    member.group.startsWith('A')
                      ? 'bg-red-50 dark:bg-red-950/30 text-[#e03e3e] dark:text-red-300 ring-red-600/20'
                      : member.group.startsWith('B')
                      ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 ring-blue-600/20'
                      : member.group.startsWith('C')
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 ring-emerald-600/20'
                      : 'bg-[#f2efe9] dark:bg-[#1d2128] text-[#5c6370] dark:text-[#a7adbb] ring-[#e4e0d8] dark:ring-[#262b38]'
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
