'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { CalendarEvent, Member } from '@/app/types';
import {
  CheckCircleIcon,
  PhoneIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ArrowTopRightOnSquareIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon, BoltIcon } from '@heroicons/react/24/solid';
import { toast } from 'sonner';

interface PointageExpressClientProps {
  initialEvents: CalendarEvent[];
  members: Member[];
  initialAttendanceMap: Record<
    string,
    Record<string, { name: string; group: string; markedAt: string }>
  >;
}

export default function PointageExpressClient({
  initialEvents,
  members,
  initialAttendanceMap,
}: PointageExpressClientProps): React.ReactElement {
  // Find default event: today or nearest upcoming/recent event
  const defaultEventId = useMemo(() => {
    if (initialEvents.length === 0) return '';
    const today = new Date().toISOString().split('T')[0];
    const todayMatch = initialEvents.find((e) => e.isoDate === today);
    if (todayMatch) return todayMatch.id;
    // Otherwise the most recent event
    return initialEvents[0].id;
  }, [initialEvents]);

  const [selectedEventId, setSelectedEventId] = useState<string>(defaultEventId);
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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-[10px] border border-[#e4e0d8] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-7 w-7 md:h-7 md:w-7 rounded-md bg-[#e03e3e]/10 text-[#e03e3e]">
              <BoltIcon className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-[#101216]">
              Pointage Express <span className="text-[#e03e3e]">Peloton</span>
            </h1>
          </div>
          <p className="mt-1 text-xs text-[#5c6370]">
            Embarquement tactile rapide au départ du samedi / dimanche matin à Blanmont.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/carre-vert"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-[#e4e0d8] bg-white text-xs font-semibold text-[#101216] hover:bg-[#faf8f5] transition-colors"
          >
            <span>Carré Vert</span>
            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-[#5c6370]" />
          </Link>
        </div>
      </div>

      {/* Event Selector & Stats Strip */}
      <div className="bg-white rounded-[10px] border border-[#e4e0d8] p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label htmlFor="express-event-select" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3a3f4a] cursor-pointer">
            <CalendarDaysIcon className="h-4 w-4 text-[#e03e3e]" />
            <span>Sortie sélectionnée</span>
          </label>

          <div className="relative flex-1 max-w-md">
            <select
              id="express-event-select"
              aria-label="Sortie sélectionnée pour le pointage"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full appearance-none rounded-md border border-[#e4e0d8] bg-[#faf8f5] py-2 pl-3 pr-8 text-xs font-medium text-[#101216] focus:border-[#e03e3e] focus:outline-hidden"
            >
              {initialEvents.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.isoDate} — {evt.location || evt.group || 'Sortie Club'}{' '}
                  {evt.distances ? `(${evt.distances})` : ''}
                </option>
              ))}
            </select>
            <ChevronUpDownIcon className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-[#5c6370]" />
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-[#efece5]">
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200/60 text-center col-span-2 sm:col-span-1">
            <div className="text-lg font-bold text-emerald-800 tabular-nums">
              {stats.present} / {stats.total}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Présents
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#faf8f5] border border-[#e4e0d8] text-center">
            <div className="text-base font-bold text-[#101216] tabular-nums">{stats.groupA}</div>
            <div className="text-xs font-medium text-[#5c6370]">Groupe A</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#faf8f5] border border-[#e4e0d8] text-center">
            <div className="text-base font-bold text-[#101216] tabular-nums">{stats.groupB}</div>
            <div className="text-xs font-medium text-[#5c6370]">Groupe B</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#faf8f5] border border-[#e4e0d8] text-center">
            <div className="text-base font-bold text-[#101216] tabular-nums">{stats.groupC}</div>
            <div className="text-xs font-medium text-[#5c6370]">Groupe C</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#faf8f5] border border-[#e4e0d8] text-center">
            <div className="text-base font-bold text-[#101216] tabular-nums">{stats.groupVTT}</div>
            <div className="text-xs font-medium text-[#5c6370]">VTT / Gravel</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#5c6370]" />
          <input
            id="express-member-search"
            type="text"
            aria-label="Rechercher un coureur pour le pointage"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un coureur (nom, prénom, GSM)..."
            className="w-full rounded-[10px] border border-[#e4e0d8] bg-white py-2.5 pl-9 pr-8 text-xs text-[#101216] placeholder:text-[#a7adbb] shadow-xs focus:border-[#e03e3e] focus:outline-hidden min-h-[44px]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 p-1 text-[#5c6370] hover:text-[#101216]"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setSelectedTab('all')}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-colors ${
              selectedTab === 'all'
                ? 'bg-[#101216] text-white'
                : 'bg-white border border-[#e4e0d8] text-[#5c6370] hover:bg-[#faf8f5]'
            }`}
          >
            Tous ({members.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('present')}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-colors ${
              selectedTab === 'present'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100/70'
            }`}
          >
            Pointés ({stats.present})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('absent')}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-colors ${
              selectedTab === 'absent'
                ? 'bg-[#101216] text-white'
                : 'bg-white border border-[#e4e0d8] text-[#5c6370] hover:bg-[#faf8f5]'
            }`}
          >
            Non pointés ({members.length - stats.present})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('A')}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-colors ${
              selectedTab === 'A'
                ? 'bg-[#e03e3e] text-white'
                : 'bg-white border border-[#e4e0d8] text-[#5c6370] hover:bg-[#faf8f5]'
            }`}
          >
            Groupe A
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('B')}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-colors ${
              selectedTab === 'B'
                ? 'bg-[#e03e3e] text-white'
                : 'bg-white border border-[#e4e0d8] text-[#5c6370] hover:bg-[#faf8f5]'
            }`}
          >
            Groupe B
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('C')}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-colors ${
              selectedTab === 'C'
                ? 'bg-[#e03e3e] text-white'
                : 'bg-white border border-[#e4e0d8] text-[#5c6370] hover:bg-[#faf8f5]'
            }`}
          >
            Groupe C
          </button>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="space-y-2">
        {filteredMembers.length === 0 ? (
          <div className="bg-white rounded-[10px] border border-[#e4e0d8] p-8 text-center text-xs text-[#5c6370]">
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
                className={`flex items-center justify-between gap-3 p-3.5 rounded-[10px] border transition-all select-none ${
                  isPresent
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                    : 'bg-white border-[#e4e0d8] hover:border-[#cfc9be]'
                }`}
              >
                {/* Clickable Area for Pointage */}
                <button
                  type="button"
                  onClick={() => handleToggleAttendance(member)}
                  disabled={isPending}
                  className="flex-1 flex items-center gap-3 text-left focus:outline-hidden min-h-[48px]"
                >
                  {/* Presence Checkbox Box */}
                  <div
                    className={`flex h-8 w-8 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-lg border transition-all ${
                      isPresent
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'border-[#d0cbd0] bg-[#faf8f5] text-transparent hover:border-[#a7adbb]'
                    }`}
                  >
                    <CheckIcon className="h-5 w-5 stroke-[3]" />
                  </div>

                  {/* Member Identity */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold tracking-tight truncate ${
                          isPresent ? 'text-emerald-950' : 'text-[#101216]'
                        }`}
                      >
                        {member.name}
                      </span>
                      {member.cotisation2026Status === 'paid' && (
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"
                          title="Cotisation 2026 en règle"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs">
                      <span className="font-semibold text-[#5c6370]">
                        Groupe {member.preferredGroup || 'B'}
                      </span>
                      {member.phone && (
                        <span className="text-[#a7adbb] font-mono tabular-nums text-xs">
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
                  className={`shrink-0 p-2.5 rounded-lg border transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    hasIce
                      ? 'border-[#e4e0d8] bg-white text-[#3a3f4a] hover:bg-[#faf8f5]'
                      : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
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
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e4e0d8] p-3 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-[#101216]">
              {stats.present} au départ ({Math.round((stats.present / (stats.total || 1)) * 100)}%)
            </span>
          </div>
          <Link
            href="/admin/carre-vert"
            className="px-4 py-2 bg-[#e03e3e] hover:bg-[#c93434] text-white text-xs font-semibold uppercase tracking-wider rounded-md shadow-xs transition-colors min-h-[40px] flex items-center"
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-t-2xl sm:rounded-[10px] border border-[#e4e0d8] w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95">
            <div className="p-4 border-b border-[#efece5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-[#e03e3e]" />
                <h3 className="text-sm font-bold text-[#101216] uppercase tracking-wider">
                  Contact Urgence ICE — {activeIceMember.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveIceMember(null)}
                className="p-1 rounded-md text-[#5c6370] hover:text-[#101216]"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {activeIceMember.iceContactPhone ? (
                <>
                  <div className="rounded-lg bg-[#faf8f5] p-4 border border-[#e4e0d8] space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#5c6370]">Contact ICE</span>
                      <span className="font-bold text-[#101216]">
                        {activeIceMember.iceContactName || 'Non spécifié'}
                      </span>
                    </div>
                    {activeIceMember.iceRelationship && (
                      <div className="flex justify-between text-xs">
                        <span className="text-[#5c6370]">Lien de parenté</span>
                        <span className="text-[#101216]">{activeIceMember.iceRelationship}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs">
                      <span className="text-[#5c6370]">Téléphone ICE</span>
                      <span className="font-mono font-bold text-[#e03e3e] tabular-nums">
                        {activeIceMember.iceContactPhone}
                      </span>
                    </div>
                  </div>

                  <a
                    href={`tel:${activeIceMember.iceContactPhone}`}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#e03e3e] hover:bg-[#c93434] text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-md transition-colors min-h-[48px]"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    <span>Appeler le contact ICE ({activeIceMember.iceContactPhone})</span>
                  </a>
                </>
              ) : (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900">
                  <p className="font-bold">Aucun contact ICE renseigné pour ce coureur.</p>
                  <p className="mt-1 text-amber-800">
                    Invitez le membre à compléter son profil dans l&apos;espace membre ou mettez-le à jour
                    dans la gestion des membres.
                  </p>
                </div>
              )}

              {/* Rider's own phone */}
              {activeIceMember.phone && (
                <a
                  href={`tel:${activeIceMember.phone}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#f2efe9] hover:bg-[#e7e3dc] text-[#101216] rounded-lg font-semibold text-xs transition-colors min-h-[44px]"
                >
                  <PhoneIcon className="h-4 w-4 text-[#5c6370]" />
                  <span>Appeler le coureur ({activeIceMember.phone})</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setActiveIceMember(null)}
                className="w-full py-2.5 text-xs font-semibold text-[#5c6370] hover:text-[#101216]"
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
