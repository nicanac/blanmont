'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { CalendarEvent, Member } from '@/app/types';
import {
  CheckCircleIcon,
  PhoneIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { toast } from 'sonner';
import { getTodayIso } from '@/app/utils/date';

interface PointageExpressClientProps {
  initialEvents: CalendarEvent[];
  members: Member[];
  initialAttendanceMap: Record<
    string,
    Record<string, { name: string; group: string; markedAt: string }>
  >;
}

/**
 * Determines the default event ID for Pointage Express:
 * 1. An event occurring today (the day's ride)
 * 2. The next upcoming event in the calendar (chronologically >= today)
 * 3. Fallback: the most recent past event (if all events have passed)
 */
export function getDefaultPointageEventId(
  events: CalendarEvent[],
  today: string = getTodayIso()
): string {
  if (!events || events.length === 0) return '';

  // 1. Check for an event today
  const todayEvent = events.find((e) => e.isoDate === today);
  if (todayEvent) return todayEvent.id;

  // 2. Next upcoming event in the calendar (closest future date)
  const upcomingEvents = events
    .filter((e) => e.isoDate && e.isoDate > today)
    .sort((a, b) => a.isoDate.localeCompare(b.isoDate));

  if (upcomingEvents.length > 0) {
    return upcomingEvents[0].id;
  }

  // 3. Fallback: most recent past event (if all scheduled events are in the past)
  const pastEvents = events
    .filter((e) => e.isoDate && e.isoDate < today)
    .sort((a, b) => b.isoDate.localeCompare(a.isoDate));

  if (pastEvents.length > 0) {
    return pastEvents[0].id;
  }

  return events[0].id;
}

export default function PointageExpressClient({
  initialEvents,
  members,
  initialAttendanceMap,
}: PointageExpressClientProps): React.ReactElement {
  const todayIso = useMemo(() => getTodayIso(), []);

  // Find default event: today or nearest upcoming/recent event
  const defaultEventId = useMemo(() => {
    return getDefaultPointageEventId(initialEvents, todayIso);
  }, [initialEvents, todayIso]);

  const [selectedEventId, setSelectedEventId] = useState<string>(defaultEventId);

  // Sync selectedEventId if query param ?eventId=... is passed or if initial selection needs refresh
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const eventIdFromUrl = params.get('eventId');
    if (eventIdFromUrl && initialEvents.some((e) => e.id === eventIdFromUrl)) {
      setSelectedEventId(eventIdFromUrl);
    } else if (!selectedEventId && defaultEventId) {
      setSelectedEventId(defaultEventId);
    }
  }, [defaultEventId, initialEvents, selectedEventId]);

  // Group events for the dropdown: upcoming/today (ascending) and past (descending)
  const { upcomingEvents, pastEvents, otherEvents } = useMemo(() => {
    const upcoming: CalendarEvent[] = [];
    const past: CalendarEvent[] = [];
    const others: CalendarEvent[] = [];

    initialEvents.forEach((evt) => {
      if (!evt.isoDate) {
        others.push(evt);
      } else if (evt.isoDate >= todayIso) {
        upcoming.push(evt);
      } else {
        past.push(evt);
      }
    });

    upcoming.sort((a, b) => (a.isoDate || '').localeCompare(b.isoDate || ''));
    past.sort((a, b) => (b.isoDate || '').localeCompare(a.isoDate || ''));

    return { upcomingEvents: upcoming, pastEvents: past, otherEvents: others };
  }, [initialEvents, todayIso]);
  const [attendanceMap, setAttendanceMap] = useState(initialAttendanceMap);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'present' | 'absent' | 'A' | 'B' | 'C' | 'VTT'>('all');
  const [activeIceMember, setActiveIceMember] = useState<Member | null>(null);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  const currentEvent = useMemo(
    () => initialEvents.find((e) => e.id === selectedEventId),
    [initialEvents, selectedEventId]
  );

  const eventAttendance = useMemo(
    () => (selectedEventId ? attendanceMap[selectedEventId] || {} : {}),
    [attendanceMap, selectedEventId]
  );

  const presentMemberIds = useMemo(
    () => new Set(Object.keys(eventAttendance)),
    [eventAttendance]
  );

  // Group counts
  const stats = useMemo(() => {
    const presentCount = presentMemberIds.size;
    let groupACount = 0;
    let groupBCount = 0;
    let groupCCount = 0;
    let groupVTTCount = 0;

    members.forEach((m) => {
      if (presentMemberIds.has(m.id)) {
        const grp = eventAttendance[m.id]?.group || m.preferredGroup || 'B';
        if (grp === 'A') groupACount++;
        else if (grp === 'B') groupBCount++;
        else if (grp === 'C') groupCCount++;
        else if (grp === 'VTT') groupVTTCount++;
      }
    });

    return {
      present: presentCount,
      total: members.length,
      groupA: groupACount,
      groupB: groupBCount,
      groupC: groupCCount,
      groupVTT: groupVTTCount,
    };
  }, [presentMemberIds, members, eventAttendance]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const isPresent = presentMemberIds.has(member.id);

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = member.name.toLowerCase().includes(query);
        const matchesPhone = member.phone?.toLowerCase().includes(query);
        if (!matchesName && !matchesPhone) return false;
      }

      // Tab filter
      if (selectedTab === 'present') return isPresent;
      if (selectedTab === 'absent') return !isPresent;
      if (selectedTab === 'A') return (member.preferredGroup || 'B') === 'A';
      if (selectedTab === 'B') return (member.preferredGroup || 'B') === 'B';
      if (selectedTab === 'C') return (member.preferredGroup || 'B') === 'C';
      if (selectedTab === 'VTT') return member.preferredGroup === 'VTT';

      return true;
    });
  }, [members, presentMemberIds, searchQuery, selectedTab]);

  // Toggle pointage handler
  const handleToggleAttendance = async (member: Member) => {
    if (!currentEvent) {
      toast.error('Veuillez sélectionner une sortie cycliste.');
      return;
    }

    const isCurrentlyPresent = presentMemberIds.has(member.id);
    const action = isCurrentlyPresent ? 'remove' : 'add';
    const memberGroup = member.preferredGroup || 'B';

    // Optional haptic feedback on mobile
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {
        // ignore
      }
    }

    // Optimistic update
    setAttendanceMap((prev) => {
      const next = { ...prev };
      const currentEvMap = { ...(next[currentEvent.id] || {}) };

      if (action === 'add') {
        currentEvMap[member.id] = {
          name: member.name,
          group: memberGroup,
          markedAt: new Date().toISOString(),
        };
      } else {
        delete currentEvMap[member.id];
      }

      next[currentEvent.id] = currentEvMap;
      return next;
    });

    setIsUpdating((prev) => ({ ...prev, [member.id]: true }));

    try {
      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: currentEvent.id,
          isoDate: currentEvent.isoDate,
          memberId: member.id,
          name: member.name,
          group: memberGroup,
          action,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      toast.success(
        action === 'add'
          ? `${member.name} pointé présent`
          : `${member.name} retiré du pointage`,
        { duration: 1500 }
      );
    } catch {
      toast.error('Erreur de connexion. Veuillez réessayer.');
      // Rollback
      setAttendanceMap(initialAttendanceMap);
    } finally {
      setIsUpdating((prev) => ({ ...prev, [member.id]: false }));
    }
  };

  // Handle express QR scan parameter (?memberId=...)
  const hasHandledQrRef = React.useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !currentEvent || hasHandledQrRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const memberIdFromUrl = params.get('memberId');
    if (!memberIdFromUrl) return;

    const targetMember = members.find((m) => m.id === memberIdFromUrl);
    if (targetMember) {
      hasHandledQrRef.current = true;
      if (!presentMemberIds.has(targetMember.id)) {
        handleToggleAttendance(targetMember);
        toast.success(`Pointage QR validé : ${targetMember.name} !`);
      } else {
        toast.info(`${targetMember.name} est déjà pointé(e) présent(e).`);
      }
      // Clean query parameter from URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [currentEvent, members, presentMemberIds]);

  return (
    <div className="space-y-5">
      {/* Event Selector & Stats Strip */}
      <div className="bg-paper dark:bg-night-2 rounded-md border border-line dark:border-night-line p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <label htmlFor="express-event-select" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-2 dark:text-snow-2 cursor-pointer font-mono">
              <CalendarDaysIcon className="h-4 w-4 text-brand" />
              <span>Sortie sélectionnée</span>
            </label>
            {currentEvent?.isoDate === todayIso && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-vert/10 text-vert border border-vert/30 font-mono">
                Aujourd&apos;hui
              </span>
            )}
            {currentEvent?.isoDate && currentEvent.isoDate > todayIso && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-brand/10 text-brand border border-brand/30 font-mono">
                À venir
              </span>
            )}
            {currentEvent?.isoDate && currentEvent.isoDate < todayIso && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-paper-2 dark:bg-night text-ink-3 dark:text-snow-3 border border-line dark:border-night-line font-mono">
                Passée
              </span>
            )}
          </div>

          <div className="relative flex-1 max-w-md">
            <select
              id="express-event-select"
              aria-label="Sortie sélectionnée pour le pointage"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              disabled={initialEvents.length === 0}
              className="w-full appearance-none rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night py-2 pl-3 pr-8 text-xs font-medium text-ink dark:text-snow-1 focus:border-brand focus:outline-hidden font-mono disabled:opacity-50"
            >
              {upcomingEvents.length > 0 && (
                <optgroup label="Sorties du jour & à venir">
                  {upcomingEvents.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.isoDate} — {evt.location || evt.group || 'Sortie Club'}{' '}
                      {evt.distances ? `(${evt.distances})` : ''}
                    </option>
                  ))}
                </optgroup>
              )}
              {pastEvents.length > 0 && (
                <optgroup label="Sorties passées">
                  {pastEvents.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.isoDate} — {evt.location || evt.group || 'Sortie Club'}{' '}
                      {evt.distances ? `(${evt.distances})` : ''}
                    </option>
                  ))}
                </optgroup>
              )}
              {otherEvents.length > 0 && (
                <optgroup label="Autres événements">
                  {otherEvents.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.isoDate || 'Date indéfinie'} — {evt.location || evt.group || 'Sortie Club'}{' '}
                      {evt.distances ? `(${evt.distances})` : ''}
                    </option>
                  ))}
                </optgroup>
              )}
              {initialEvents.length === 0 && (
                <option value="">Aucune sortie disponible</option>
              )}
            </select>
            <ChevronUpDownIcon className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-ink-3 dark:text-snow-3" />
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-line/40 dark:border-night-line">
          <div className="p-2.5 rounded-sm bg-vert/10 border border-vert/30 text-center col-span-2 sm:col-span-1">
            <div className="text-lg font-bold text-vert dark:text-vert-light tabular-nums font-mono">
              {stats.present} / {stats.total}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-vert dark:text-vert-light font-mono">
              Présents
            </div>
          </div>
          <div className="p-2.5 rounded-sm bg-paper-2 dark:bg-night border border-line dark:border-night-line text-center">
            <div className="text-base font-bold text-ink dark:text-snow-1 tabular-nums font-mono">{stats.groupA}</div>
            <div className="text-xs font-medium text-ink-3 dark:text-snow-3 font-mono">Groupe A</div>
          </div>
          <div className="p-2.5 rounded-sm bg-paper-2 dark:bg-night border border-line dark:border-night-line text-center">
            <div className="text-base font-bold text-ink dark:text-snow-1 tabular-nums font-mono">{stats.groupB}</div>
            <div className="text-xs font-medium text-ink-3 dark:text-snow-3 font-mono">Groupe B</div>
          </div>
          <div className="p-2.5 rounded-sm bg-paper-2 dark:bg-night border border-line dark:border-night-line text-center">
            <div className="text-base font-bold text-ink dark:text-snow-1 tabular-nums font-mono">{stats.groupC}</div>
            <div className="text-xs font-medium text-ink-3 dark:text-snow-3 font-mono">Groupe C</div>
          </div>
          <div className="p-2.5 rounded-sm bg-paper-2 dark:bg-night border border-line dark:border-night-line text-center">
            <div className="text-base font-bold text-ink dark:text-snow-1 tabular-nums font-mono">{stats.groupVTT}</div>
            <div className="text-xs font-medium text-ink-3 dark:text-snow-3 font-mono">VTT / Gravel</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-3 dark:text-snow-3" />
          <input
            id="express-member-search"
            type="text"
            aria-label="Rechercher un coureur pour le pointage"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un coureur (nom, prénom, GSM)..."
            className="w-full rounded-sm border border-line dark:border-night-line bg-paper dark:bg-night-2 py-2.5 pl-9 pr-8 text-xs text-ink dark:text-snow-1 placeholder:text-ink-3 dark:placeholder:text-snow-3 focus:border-brand focus:outline-hidden min-h-[44px]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 p-1 text-ink-3 hover:text-ink dark:hover:text-white"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
          <button
            type="button"
            onClick={() => setSelectedTab('all')}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-colors ${
              selectedTab === 'all'
                ? 'bg-ink dark:bg-paper text-white dark:text-ink'
                : 'bg-paper dark:bg-night-2 border border-line dark:border-night-line text-ink-3 dark:text-snow-3 hover:bg-paper-2'
            }`}
          >
            Tous ({members.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('present')}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-colors ${
              selectedTab === 'present'
                ? 'bg-vert text-white'
                : 'bg-vert/10 border border-vert/30 text-vert dark:text-vert-light hover:bg-vert/20'
            }`}
          >
            Pointés ({stats.present})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('absent')}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-colors ${
              selectedTab === 'absent'
                ? 'bg-ink dark:bg-paper text-white dark:text-ink'
                : 'bg-paper dark:bg-night-2 border border-line dark:border-night-line text-ink-3 dark:text-snow-3 hover:bg-paper-2'
            }`}
          >
            Non pointés ({members.length - stats.present})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('A')}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-colors ${
              selectedTab === 'A'
                ? 'bg-brand text-white'
                : 'bg-paper dark:bg-night-2 border border-line dark:border-night-line text-ink-3 dark:text-snow-3 hover:bg-paper-2'
            }`}
          >
            Groupe A
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('B')}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-colors ${
              selectedTab === 'B'
                ? 'bg-brand text-white'
                : 'bg-paper dark:bg-night-2 border border-line dark:border-night-line text-ink-3 dark:text-snow-3 hover:bg-paper-2'
            }`}
          >
            Groupe B
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('C')}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-colors ${
              selectedTab === 'C'
                ? 'bg-brand text-white'
                : 'bg-paper dark:bg-night-2 border border-line dark:border-night-line text-ink-3 dark:text-snow-3 hover:bg-paper-2'
            }`}
          >
            Groupe C
          </button>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="space-y-2">
        {filteredMembers.length === 0 ? (
          <div className="bg-paper dark:bg-night-2 rounded-sm border border-line dark:border-night-line p-8 text-center text-xs text-ink-3 dark:text-snow-3 font-mono">
            Aucun coureur ne correspond à votre filtre.
          </div>
        ) : (
          filteredMembers.map((member) => {
            const isPresent = presentMemberIds.has(member.id);
            const isPending = isUpdating[member.id];
            const hasIce = Boolean(member.iceContactName && member.iceContactPhone);

            return (
              <div
                key={member.id}
                className={`flex items-center justify-between gap-3 p-3.5 rounded-sm border transition-all select-none ${
                  isPresent
                    ? 'bg-vert/10 border-vert/40 text-ink dark:text-snow-1'
                    : 'bg-paper dark:bg-night-2 border-line dark:border-night-line hover:border-line-strong'
                }`}
              >
                {/* Clickable Area for Pointage */}
                <button
                  type="button"
                  onClick={() => handleToggleAttendance(member)}
                  disabled={isPending}
                  className="flex-1 flex items-center gap-3 text-left focus:outline-hidden min-h-[48px] cursor-pointer"
                >
                  {/* Presence Checkbox Box */}
                  <div
                    className={`flex h-8 w-8 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-xs border transition-all ${
                      isPresent
                        ? 'bg-vert border-vert text-white'
                        : 'border-line-strong bg-paper-2 dark:bg-night text-transparent hover:border-snow-3'
                    }`}
                  >
                    <CheckIcon className="h-5 w-5 stroke-[3]" />
                  </div>

                  {/* Member Identity */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold tracking-tight truncate ${
                          isPresent ? 'text-vert dark:text-vert-light' : 'text-ink dark:text-snow-1'
                        }`}
                      >
                        {member.name}
                      </span>
                      {member.cotisation2026Status === 'paid' && (
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-vert shrink-0"
                          title="Cotisation 2026 en règle"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs font-mono">
                      <span className="font-semibold text-ink-3 dark:text-snow-3">
                        Groupe {member.preferredGroup || 'B'}
                      </span>
                      {member.phone && (
                        <span className="text-ink-3 dark:text-snow-3 font-mono tabular-nums text-xs">
                          {member.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {/* Quick ICE Button */}
                <button
                  type="button"
                  onClick={() => setActiveIceMember(member)}
                  className={`shrink-0 p-2.5 rounded-sm border transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer ${
                    hasIce
                      ? 'border-line dark:border-night-line bg-paper-2 dark:bg-night text-ink-2 dark:text-snow-2 hover:bg-paper-3'
                      : 'border-ambre/30 bg-ambre/10 text-ambre-dark dark:text-ambre hover:bg-ambre/20 font-mono'
                  }`}
                  title={hasIce ? 'Fiche urgence ICE' : 'Aucun contact ICE renseigné'}
                >
                  <ShieldCheckIcon className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Sticky Bottom Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-paper dark:bg-night border-t border-line dark:border-night-line p-3 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-vert animate-pulse" />
            <span className="text-xs font-bold text-ink dark:text-snow-1 tabular-nums">
              {stats.present} au départ ({Math.round((stats.present / (stats.total || 1)) * 100)}%)
            </span>
          </div>
          <Link
            href="/admin/carre-vert"
            className="px-4 py-2 bg-brand hover:bg-brand-strong text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors min-h-[40px] flex items-center"
          >
            Valider au Carré Vert
          </Link>
        </div>
      </div>

      {/* ICE Emergency Modal */}
      {activeIceMember && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/70 dark:bg-black/80 p-4"
        >
          <div className="bg-paper dark:bg-night-2 rounded-md border border-line dark:border-night-line w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95">
            <div className="p-4 border-b border-line dark:border-night-line bg-paper-2 dark:bg-night flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-brand" />
                <h3 className="text-sm font-bold text-ink dark:text-snow-1 uppercase tracking-wider font-mono">
                  Contact Urgence ICE — {activeIceMember.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveIceMember(null)}
                className="p-1 rounded-sm text-ink-3 hover:text-ink dark:hover:text-snow-1"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {activeIceMember.iceContactPhone ? (
                <>
                  <div className="rounded-sm bg-paper-2 dark:bg-night p-4 border border-line dark:border-night-line space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-3 dark:text-snow-3 font-mono">Contact ICE</span>
                      <span className="font-bold text-ink dark:text-snow-1">
                        {activeIceMember.iceContactName || 'Non spécifié'}
                      </span>
                    </div>
                    {activeIceMember.iceRelationship && (
                      <div className="flex justify-between text-xs">
                        <span className="text-ink-3 dark:text-snow-3 font-mono">Lien de parenté</span>
                        <span className="text-ink dark:text-snow-1">{activeIceMember.iceRelationship}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-ink-3 dark:text-snow-3">Téléphone ICE</span>
                      <span className="font-bold text-brand tabular-nums">
                        {activeIceMember.iceContactPhone}
                      </span>
                    </div>
                  </div>

                  <a
                    href={`tel:${activeIceMember.iceContactPhone}`}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-brand hover:bg-brand-strong text-white rounded-sm font-bold text-xs uppercase tracking-wider transition-colors min-h-[48px] font-mono"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    <span>Appeler le contact ICE ({activeIceMember.iceContactPhone})</span>
                  </a>
                </>
              ) : (
                <div className="rounded-sm bg-ambre/10 border border-ambre/30 p-4 text-xs text-ambre-dark dark:text-ambre font-mono">
                  <p className="font-bold">Aucun contact ICE renseigné pour ce coureur.</p>
                  <p className="mt-1">
                    Invitez le membre à compléter son profil dans l&apos;espace membre ou mettez-le à jour
                    dans la gestion des membres.
                  </p>
                </div>
              )}

              {/* Rider's own phone */}
              {activeIceMember.phone && (
                <a
                  href={`tel:${activeIceMember.phone}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-paper-2 dark:bg-night hover:bg-paper-3 dark:hover:bg-night-line text-ink dark:text-snow-1 rounded-sm font-semibold text-xs transition-colors min-h-[44px] font-mono"
                >
                  <PhoneIcon className="h-4 w-4 text-ink-3 dark:text-snow-3" />
                  <span>Appeler le coureur ({activeIceMember.phone})</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setActiveIceMember(null)}
                className="w-full py-2.5 text-xs font-semibold text-ink-3 hover:text-ink dark:hover:text-snow-1 font-mono cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
