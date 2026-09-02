'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { CalendarEvent } from '../types';
import CalendarDrawer from './CalendarDrawer';
import RideWeatherBadge from '../components/ui/RideWeatherBadge';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  MapPinIcon,
  ClockIcon,
  MapIcon,
  UserGroupIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';

const MONTH_NAMES = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

const WEEKDAY_NAMES = [
  { short: 'Lun', full: 'Lundi' },
  { short: 'Mar', full: 'Mardi' },
  { short: 'Mer', full: 'Mercredi' },
  { short: 'Jeu', full: 'Jeudi' },
  { short: 'Ven', full: 'Vendredi' },
  { short: 'Sam', full: 'Samedi', isWeekend: true },
  { short: 'Dim', full: 'Dimanche', isWeekend: true },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  // Monday start: Sun(0) -> 6, Mon(1) -> 0
  return day === 0 ? 6 : day - 1;
}

const normalizeText = (str: string) =>
  str
    ? str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
    : '';

type AttendeeInfo = { name: string; group: string };
type ViewMode = 'grid' | 'agenda';
type FilterType = 'all' | 'saturday' | 'sunday' | 'gpx';

export default function CalendarView({
  events,
  attendanceMap = {},
}: {
  events: CalendarEvent[];
  attendanceMap?: Record<string, AttendeeInfo[]>;
}) {
  const { isAdmin } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('agenda');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const isSearching = Boolean(searchQuery.trim());

  // Global search across ALL months and years (past & future) with diacritic normalization
  const searchedEvents = useMemo(() => {
    if (!isSearching) return [];
    const query = normalizeText(searchQuery);

    return events
      .filter((e) => {
        if (!e.isoDate) return false;
        const [y, m, d] = e.isoDate.split('-').map(Number);

        // Category Filter during search
        if (filterType === 'saturday') {
          const dateObj = new Date(y, m - 1, d);
          if (dateObj.getDay() !== 6) return false;
        } else if (filterType === 'sunday') {
          const dateObj = new Date(y, m - 1, d);
          if (dateObj.getDay() !== 0) return false;
        } else if (filterType === 'gpx') {
          if (!e.gpxUrl) return false;
        }

        const matchesLocation = normalizeText(e.location || '').includes(query);
        const matchesAddress = normalizeText(e.address || '').includes(query);
        const matchesRemarks = normalizeText(e.remarks || '').includes(query);
        const matchesDistances = normalizeText(e.distances || '').includes(query);
        const matchesAlternative = normalizeText(e.alternative || '').includes(query);
        const matchesGroup = normalizeText(e.group || '').includes(query);
        const matchesDate = (e.isoDate || '').toLowerCase().includes(query);
        const monthName = normalizeText(MONTH_NAMES[m - 1] || '');
        const matchesMonthName = monthName.includes(query);

        return (
          matchesLocation ||
          matchesAddress ||
          matchesRemarks ||
          matchesDistances ||
          matchesAlternative ||
          matchesGroup ||
          matchesDate ||
          matchesMonthName
        );
      })
      .sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  }, [events, searchQuery, filterType, isSearching]);

  // Current Month Days
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);

  // Previous month padding
  const prevMonthPadding = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const day = daysInPrevMonth - firstDayOfWeek + i + 1;
    const d = new Date(year, month - 1, day);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { day, currentMonth: false, dateStr, isWeekend: false };
  });

  // Current month days
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const d = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
    return { day, currentMonth: true, dateStr, isWeekend: dayOfWeek === 0 || dayOfWeek === 6 };
  });

  // Next month padding (up to 35 or 42 slots)
  const totalSlotsNeeded = prevMonthPadding.length + currentMonthDays.length > 35 ? 42 : 35;
  const remainingSlots = totalSlotsNeeded - (prevMonthPadding.length + currentMonthDays.length);
  const nextMonthPadding = Array.from({ length: remainingSlots }, (_, i) => {
    const day = i + 1;
    const d = new Date(year, month + 1, day);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { day, currentMonth: false, dateStr, isWeekend: false };
  });

  const allCalendarDays = [...prevMonthPadding, ...currentMonthDays, ...nextMonthPadding];

  // Month Events (for standard month-by-month navigation)
  const monthEvents = useMemo(() => {
    return events.filter((e) => {
      if (!e.isoDate) return false;
      const [y, m, d] = e.isoDate.split('-').map(Number);
      if (y !== year || m - 1 !== month) return false;

      // Category Filter
      if (filterType === 'saturday') {
        const dateObj = new Date(y, m - 1, d);
        if (dateObj.getDay() !== 6) return false;
      } else if (filterType === 'sunday') {
        const dateObj = new Date(y, m - 1, d);
        if (dateObj.getDay() !== 0) return false;
      } else if (filterType === 'gpx') {
        if (!e.gpxUrl) return false;
      }

      return true;
    });
  }, [events, year, month, filterType]);

  // Navigation handlers
  const goToPreviousMonth = useCallback(() => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)), []);
  const goToNextMonth = useCallback(() => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)), []);
  const goToToday = useCallback(() => setCurrentDate(new Date()), []);

  const handleJumpToMonth = (isoDate: string) => {
    const [y, m] = isoDate.split('-').map(Number);
    setCurrentDate(new Date(y, m - 1, 1));
    setSearchQuery('');
  };

  // Keyboard navigation for previous/next months when not typing in inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === 'ArrowLeft') {
        goToPreviousMonth();
      } else if (e.key === 'ArrowRight') {
        goToNextMonth();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPreviousMonth, goToNextMonth]);

  return (
    <div className="space-y-6">
      {/* ──── Controls & Filter Toolbar ──── */}
      <div className="rounded-lg border border-[#e4e0d8] bg-white p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Month Title & Nav */}
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101216] min-w-[200px]">
              {MONTH_NAMES[month]} <span className="text-[#5c6370] font-normal tabular-nums">{year}</span>
            </h2>

            <div className="inline-flex items-center rounded-md border border-[#e4e0d8] bg-[#f2efe9]/60 p-0.5">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-[#5c6370] hover:text-[#101216] hover:bg-white transition-colors"
                title="Mois précédent"
                aria-label="Mois précédent"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goToToday}
                className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-[#101216] hover:bg-white rounded transition-colors flex items-center justify-center"
              >
                Aujourd&apos;hui
              </button>
              <button
                type="button"
                onClick={goToNextMonth}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-[#5c6370] hover:text-[#101216] hover:bg-white transition-colors"
                title="Mois suivant"
                aria-label="Mois suivant"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Side: View Switcher & Global Search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search input across all months */}
            <div className="relative flex-1 sm:w-72 sm:flex-none">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5c6370]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher (tous les mois)..."
                aria-label="Rechercher une sortie, un lieu ou un mois"
                className="w-full min-h-[44px] pl-10 pr-10 py-2 text-xs rounded-md border border-[#e4e0d8] bg-[#faf8f5] focus:bg-white focus:outline-none focus:border-[#e03e3e] transition-colors text-[#101216] placeholder:text-[#5c6370]"
              />
              {isSearching && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="min-h-[44px] min-w-[44px] absolute right-0 top-0 flex items-center justify-center text-[#5c6370] hover:text-[#101216]"
                  title="Effacer la recherche"
                  aria-label="Effacer la recherche"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="inline-flex items-center rounded-md border border-[#e4e0d8] bg-[#f2efe9]/70 p-1">
              <button
                type="button"
                onClick={() => setViewMode('agenda')}
                className={cn(
                  'min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded text-xs font-semibold transition-all',
                  viewMode === 'agenda' || isSearching
                    ? 'bg-white text-[#101216] shadow-xs'
                    : 'text-[#5c6370] hover:text-[#101216]'
                )}
              >
                <ListBulletIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Agenda</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded text-xs font-semibold transition-all',
                  viewMode === 'grid' && !isSearching
                    ? 'bg-white text-[#101216] shadow-xs'
                    : 'text-[#5c6370] hover:text-[#101216]'
                )}
              >
                <Squares2X2Icon className="h-4 w-4" />
                <span className="hidden sm:inline">Grille</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#e4e0d8]">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#5c6370] mr-1">
            Filtrer :
          </span>

          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={cn(
              'min-h-[44px] px-4 py-2 rounded-md text-xs font-semibold transition-colors flex items-center justify-center',
              filterType === 'all'
                ? 'bg-[#101216] text-white'
                : 'bg-[#f2efe9] text-[#5c6370] hover:bg-[#e4e0d8] hover:text-[#101216]'
            )}
          >
            {isSearching ? `Toutes (${searchedEvents.length})` : `Toutes (${monthEvents.length})`}
          </button>

          <button
            type="button"
            onClick={() => setFilterType('saturday')}
            className={cn(
              'min-h-[44px] px-4 py-2 rounded-md text-xs font-semibold transition-colors flex items-center justify-center',
              filterType === 'saturday'
                ? 'bg-[#e03e3e] text-white'
                : 'bg-[#f2efe9] text-[#5c6370] hover:bg-[#e4e0d8] hover:text-[#101216]'
            )}
          >
            Samedi (Route)
          </button>

          <button
            type="button"
            onClick={() => setFilterType('sunday')}
            className={cn(
              'min-h-[44px] px-4 py-2 rounded-md text-xs font-semibold transition-colors flex items-center justify-center',
              filterType === 'sunday'
                ? 'bg-[#e03e3e] text-white'
                : 'bg-[#f2efe9] text-[#5c6370] hover:bg-[#e4e0d8] hover:text-[#101216]'
            )}
          >
            Dimanche (Route &amp; VTT)
          </button>

          <button
            type="button"
            onClick={() => setFilterType('gpx')}
            className={cn(
              'min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-colors',
              filterType === 'gpx'
                ? 'bg-sky-600 text-white'
                : 'bg-[#f2efe9] text-[#5c6370] hover:bg-[#e4e0d8] hover:text-[#101216]'
            )}
          >
            <MapIcon className="h-3.5 w-3.5" />
            <span>Avec Parcours GPX</span>
          </button>
        </div>
      </div>

      {/* ──── Active Search Mode: Global Results Across All Months ──── */}
      {isSearching ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-white border border-[#e4e0d8] shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-[#e03e3e] animate-pulse" />
              <p className="text-xs sm:text-sm text-[#101216]">
                Recherche globale sur <strong className="font-bold">toute la saison</strong> pour « <span className="font-semibold text-[#e03e3e]">{searchQuery}</span> »
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5c6370] tabular-nums">
                {searchedEvents.length} résultat{searchedEvents.length !== 1 ? 's' : ''} trouvé{searchedEvents.length !== 1 ? 's' : ''}
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="min-h-[44px] inline-flex items-center gap-1 text-xs font-semibold text-[#e03e3e] hover:underline"
              >
                <span>Effacer</span>
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {searchedEvents.length > 0 ? (
            <ul className="space-y-4" role="list">
              {searchedEvents.map((event) => {
                const [y, m, d] = event.isoDate.split('-').map(Number);
                const dateObj = new Date(y, m - 1, d);
                const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                const weekdayStr = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' });
                const monthStr = dateObj.toLocaleDateString('fr-FR', { month: 'short' });
                const fullDateStr = dateObj.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                });
                const attendees = attendanceMap[event.id] || [];

                return (
                  <li
                    key={event.id}
                    className="group rounded-lg border border-[#e4e0d8] bg-white p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-[#e03e3e]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    {/* Primary Click Target: Focusable accessible button for event details */}
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(event)}
                      aria-label={`Détails de la sortie ${event.location} le ${fullDateStr}`}
                      className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0 text-left rounded-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#e03e3e] -m-1.5 p-1.5"
                    >
                      {/* Date Block */}
                      <div
                        className={cn(
                          'flex-none rounded-lg p-3 text-center w-16 sm:w-20 flex flex-col justify-center items-center border',
                          isWeekend
                            ? 'bg-[#161922] text-white border-[#161922]'
                            : 'bg-[#f2efe9] text-[#101216] border-[#e4e0d8]'
                        )}
                      >
                        <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#e03e3e]">
                          {weekdayStr.slice(0, 3)}
                        </span>
                        <span className="text-xl sm:text-2xl font-extrabold tabular-nums leading-tight">
                          {dateObj.getDate()}
                        </span>
                        <span className={cn('text-xs font-semibold uppercase', isWeekend ? 'text-[#a7adbb]' : 'text-[#5c6370]')}>
                          {monthStr}
                        </span>
                      </div>

                      {/* Middle Info */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e03e3e]/10 text-[#e03e3e] px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.06em]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#e03e3e]" />
                            {isWeekend ? 'Sortie Club' : 'Événement'}
                          </span>

                          <span className="text-xs font-semibold text-[#5c6370] bg-[#f2efe9] px-2.5 py-0.5 rounded-full tabular-nums">
                            {fullDateStr}
                          </span>

                          {event.group && (
                            <span className="text-xs font-medium text-[#3a3f4a] bg-[#f2efe9] px-2.5 py-0.5 rounded-full">
                              {event.group}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-[#101216] group-hover:text-[#e03e3e] transition-colors truncate">
                          {event.location}
                        </h3>

                        {/* Meta list */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5c6370]">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-3.5 w-3.5 text-[#5c6370]" />
                            <strong className="text-[#101216] font-semibold tabular-nums">{event.departure}</strong>
                          </span>

                          {event.distances && (
                            <span className="flex items-center gap-1 tabular-nums">
                              <span>🚲</span>
                              <strong className="text-[#101216] font-semibold">{event.distances} km</strong>
                            </span>
                          )}

                          {event.address && (
                            <span className="flex items-center gap-1 truncate max-w-xs">
                              <MapPinIcon className="h-3.5 w-3.5 text-[#5c6370]" />
                              <span>{event.address}</span>
                            </span>
                          )}
                        </div>

                        {event.alternative && (
                          <p className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 inline-block">
                            Alternative : {event.alternative}
                          </p>
                        )}
                      </div>
                    </button>

                    {/* Right: Weather & Independent Actions */}
                    <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-[#e4e0d8]">
                      <div>
                        <RideWeatherBadge isoDate={event.isoDate} departure={event.departure} compact={true} />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleJumpToMonth(event.isoDate)}
                          className="min-h-[44px] inline-flex items-center gap-1.5 rounded-md border border-[#e4e0d8] bg-white hover:bg-[#f2efe9] text-[#101216] px-3.5 py-2 text-xs font-semibold transition-colors"
                          title="Afficher ce mois dans le calendrier"
                        >
                          <CalendarDaysIcon className="h-4 w-4 text-[#5c6370]" />
                          <span>Aller au mois</span>
                        </button>

                        {event.gpxUrl && (
                          <a
                            href={event.gpxUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-h-[44px] inline-flex items-center gap-1.5 rounded-md border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 px-3.5 py-2 text-xs font-bold transition-colors"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            <span>Parcours GPX</span>
                          </a>
                        )}

                        {attendees.length > 0 && (
                          <span className="min-h-[44px] inline-flex items-center gap-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 text-xs font-bold">
                            <UserGroupIcon className="h-4 w-4" />
                            <span className="tabular-nums">{attendees.length}</span>
                          </span>
                        )}

                        {isAdmin && (
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md border border-[#e4e0d8] hover:bg-[#f2efe9] text-[#5c6370] hover:text-[#101216] transition-colors"
                            title="Modifier l'événement"
                            aria-label="Modifier l'événement"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-lg border border-[#e4e0d8] bg-white p-12 text-center space-y-3">
              <CalendarDaysIcon className="mx-auto h-10 w-10 text-[#5c6370]" />
              <h3 className="text-base font-bold text-[#101216]">Aucune sortie trouvée</h3>
              <p className="text-xs sm:text-sm text-[#5c6370] max-w-sm mx-auto">
                Aucune sortie ne correspond à « {searchQuery} » sur l&apos;ensemble de la saison.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="min-h-[44px] inline-flex items-center gap-2 rounded-md bg-[#e03e3e] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#c93434] transition-colors"
              >
                Réinitialiser la recherche
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ──── Regular Month View (Grid or Agenda) ──── */
        <>
          {viewMode === 'grid' && (
            <div className="rounded-lg border border-[#e4e0d8] bg-white shadow-xs overflow-hidden">
              {/* Weekday Header Row */}
              <div className="grid grid-cols-7 border-b border-[#e4e0d8] bg-[#f2efe9] text-center text-xs font-bold uppercase tracking-[0.06em] text-[#5c6370]">
                {WEEKDAY_NAMES.map((wd, i) => (
                  <div
                    key={i}
                    className={cn(
                      'py-3 border-r border-[#e4e0d8] last:border-r-0',
                      wd.isWeekend ? 'text-[#e03e3e] bg-[#ede8e1]' : ''
                    )}
                  >
                    <span className="hidden sm:inline">{wd.full}</span>
                    <span className="sm:hidden">{wd.short}</span>
                  </div>
                ))}
              </div>

              {/* Month Calendar Grid (7 columns) */}
              <div className="grid grid-cols-7 divide-x divide-y divide-[#e4e0d8]">
                {allCalendarDays.map((cell, idx) => {
                  const dayEvents = cell.currentMonth
                    ? monthEvents.filter((e) => e.isoDate === cell.dateStr)
                    : [];
                  const isToday = cell.dateStr === todayStr;

                  return (
                    <div
                      key={idx}
                      className={cn(
                        'min-h-[110px] sm:min-h-[135px] p-2 sm:p-2.5 transition-colors flex flex-col justify-between',
                        cell.currentMonth
                          ? cell.isWeekend
                            ? 'bg-[#fbf9f6]'
                            : 'bg-white'
                          : 'bg-[#f5f3ef]/60 opacity-40 select-none'
                      )}
                    >
                      {/* Day number header */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={cn(
                            'text-xs font-bold tabular-nums inline-flex items-center justify-center',
                            isToday
                              ? 'h-6 w-6 rounded-full bg-[#e03e3e] text-white shadow-xs'
                              : cell.isWeekend
                              ? 'text-[#101216]'
                              : 'text-[#5c6370]'
                          )}
                        >
                          {cell.day}
                        </span>

                        {dayEvents.length > 0 && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#e03e3e]" />
                        )}
                      </div>

                      {/* Event Cards inside cell */}
                      <div className="space-y-1.5 flex-1">
                        {dayEvents.map((event) => {
                          const attendees = attendanceMap[event.id] || [];
                          return (
                            <button
                              key={event.id}
                              type="button"
                              onClick={() => setSelectedEvent(event)}
                              aria-label={`Détails de la sortie ${event.location} à ${event.departure}`}
                              className="w-full text-left rounded p-1.5 bg-[#161922] text-white hover:bg-[#e03e3e] transition-colors group/ev block shadow-2xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#e03e3e]"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs truncate leading-tight">
                                  {event.location}
                                </span>
                                {event.departure && (
                                  <span className="text-xs font-semibold tabular-nums opacity-90 shrink-0">
                                    {event.departure}
                                  </span>
                                )}
                              </div>

                              {event.distances && (
                                <p className="text-xs opacity-80 truncate mt-0.5 tabular-nums">
                                  {event.distances} km
                                </p>
                              )}

                              {attendees.length > 0 && (
                                <div className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
                                  <UserGroupIcon className="h-3 w-3" />
                                  <span className="tabular-nums">{attendees.length}</span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'agenda' && (
            <div>
              {monthEvents.length > 0 ? (
                <ul className="space-y-4" role="list">
                  {monthEvents.map((event) => {
                    const [y, m, d] = event.isoDate.split('-').map(Number);
                    const dateObj = new Date(y, m - 1, d);
                    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                    const weekdayStr = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' });
                    const monthStr = dateObj.toLocaleDateString('fr-FR', { month: 'short' });
                    const fullDateStr = dateObj.toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    });
                    const attendees = attendanceMap[event.id] || [];

                    return (
                      <li
                        key={event.id}
                        className="group rounded-lg border border-[#e4e0d8] bg-white p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-[#e03e3e]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                      >
                        {/* Primary Focusable Trigger for Event Details */}
                        <button
                          type="button"
                          onClick={() => setSelectedEvent(event)}
                          aria-label={`Détails de la sortie ${event.location} le ${fullDateStr}`}
                          className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0 text-left rounded-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#e03e3e] -m-1.5 p-1.5"
                        >
                          {/* Date Block */}
                          <div
                            className={cn(
                              'flex-none rounded-lg p-3 text-center w-16 sm:w-20 flex flex-col justify-center items-center border',
                              isWeekend
                                ? 'bg-[#161922] text-white border-[#161922]'
                                : 'bg-[#f2efe9] text-[#101216] border-[#e4e0d8]'
                            )}
                          >
                            <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#e03e3e]">
                              {weekdayStr.slice(0, 3)}
                            </span>
                            <span className="text-xl sm:text-2xl font-extrabold tabular-nums leading-tight">
                              {dateObj.getDate()}
                            </span>
                            <span className={cn('text-xs font-semibold uppercase', isWeekend ? 'text-[#a7adbb]' : 'text-[#5c6370]')}>
                              {monthStr}
                            </span>
                          </div>

                          {/* Middle Info */}
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e03e3e]/10 text-[#e03e3e] px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.06em]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#e03e3e]" />
                                {isWeekend ? 'Sortie Club' : 'Événement'}
                              </span>

                              {event.group && (
                                <span className="text-xs font-medium text-[#3a3f4a] bg-[#f2efe9] px-2.5 py-0.5 rounded-full">
                                  {event.group}
                                </span>
                              )}
                            </div>

                            <h3 className="text-lg font-bold text-[#101216] group-hover:text-[#e03e3e] transition-colors truncate">
                              {event.location}
                            </h3>

                            {/* Meta list */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5c6370]">
                              <span className="flex items-center gap-1">
                                <ClockIcon className="h-3.5 w-3.5 text-[#5c6370]" />
                                <strong className="text-[#101216] font-semibold tabular-nums">{event.departure}</strong>
                              </span>

                              {event.distances && (
                                <span className="flex items-center gap-1 tabular-nums">
                                  <span>🚲</span>
                                  <strong className="text-[#101216] font-semibold">{event.distances} km</strong>
                                </span>
                              )}

                              {event.address && (
                                <span className="flex items-center gap-1 truncate max-w-xs">
                                  <MapPinIcon className="h-3.5 w-3.5 text-[#5c6370]" />
                                  <span>{event.address}</span>
                                </span>
                              )}
                            </div>

                            {event.alternative && (
                              <p className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 inline-block">
                                Alternative : {event.alternative}
                              </p>
                            )}
                          </div>
                        </button>

                        {/* Right: Weather & Actions */}
                        <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-[#e4e0d8]">
                          <div>
                            <RideWeatherBadge isoDate={event.isoDate} departure={event.departure} compact={true} />
                          </div>

                          <div className="flex items-center gap-2">
                            {event.gpxUrl && (
                              <a
                                href={event.gpxUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="min-h-[44px] inline-flex items-center gap-1.5 rounded-md border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 px-3.5 py-2 text-xs font-bold transition-colors"
                              >
                                <ArrowDownTrayIcon className="h-4 w-4" />
                                <span>Parcours GPX</span>
                              </a>
                            )}

                            {attendees.length > 0 && (
                              <span className="min-h-[44px] inline-flex items-center gap-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 text-xs font-bold">
                                <UserGroupIcon className="h-4 w-4" />
                                <span className="tabular-nums">{attendees.length} inscrits</span>
                              </span>
                            )}

                            {isAdmin && (
                              <Link
                                href={`/admin/events/${event.id}/edit`}
                                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md border border-[#e4e0d8] hover:bg-[#f2efe9] text-[#5c6370] hover:text-[#101216] transition-colors"
                                title="Modifier l'événement"
                                aria-label="Modifier l'événement"
                              >
                                <PencilSquareIcon className="h-4 w-4" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="rounded-lg border border-[#e4e0d8] bg-white p-12 text-center">
                  <CalendarDaysIcon className="mx-auto h-10 w-10 text-[#5c6370]" />
                  <h3 className="mt-3 text-base font-bold text-[#101216]">Aucune sortie trouvée</h3>
                  <p className="mt-1 text-xs text-[#5c6370]">
                    Aucun événement ne correspond à vos critères pour ce mois.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ──── Slide-out Detail Drawer ──── */}
      <CalendarDrawer
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        attendees={selectedEvent ? attendanceMap[selectedEvent.id] || [] : []}
      />
    </div>
  );
}

