'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CalendarEvent, EventReview } from '../types';
import CalendarDrawer, { isEventDone } from './CalendarDrawer';
import RideWeatherBadge from '../components/ui/RideWeatherBadge';
import { parseDateInfo } from '../lib/carreVert';
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
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { BicycleIcon } from '@/app/components/ui/CyclingIcons';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import { useIsMounted } from '../utils/useIsMounted';

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

interface AgendaItemProps {
  event: CalendarEvent;
  attendees: AttendeeInfo[];
  reviews: EventReview[];
  isNextRide: boolean;
  isToday: boolean;
  isPast: boolean;
  onSelectEvent: (event: CalendarEvent) => void;
  onJumpToMonth?: (isoDate: string) => void;
  isAdmin: boolean;
  mounted: boolean;
}

function AgendaItem({
  event,
  attendees,
  reviews,
  isNextRide,
  isToday,
  isPast,
  onSelectEvent,
  onJumpToMonth,
  isAdmin,
  mounted,
}: AgendaItemProps) {
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

  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <li
      className={cn(
        'group relative rounded-lg border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5 p-4 sm:p-5',
        isNextRide
          ? 'bg-white dark:bg-[#161922] border-[#e03e3e]/40 dark:border-[#e03e3e]/50 shadow-xs hover:border-[#e03e3e] hover:shadow-md'
          : isPast
          ? 'bg-[#faf8f5]/90 dark:bg-[#12151c] border-[#e4e0d8] dark:border-[#222733] hover:border-[#101216]/20 dark:hover:border-white/20'
          : 'bg-white dark:bg-[#161922] border-[#e4e0d8] dark:border-[#262b38] shadow-xs hover:border-[#e03e3e]/40 hover:shadow-md'
      )}
    >
      {/* Primary Click Target / Accessible Trigger */}
      <button
        type="button"
        onClick={() => onSelectEvent(event)}
        aria-label={`Détails de la sortie ${event.location} le ${fullDateStr}`}
        className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0 text-left rounded-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#e03e3e] -m-1.5 p-1.5 cursor-pointer"
      >
        {/* Date Block: Editorial High-Contrast Badge */}
        <div
          className={cn(
            'flex-none rounded-md w-16 sm:w-20 py-2.5 px-2 text-center flex flex-col items-center justify-center border transition-colors shrink-0',
            isNextRide
              ? 'bg-[#e03e3e]/10 border-[#e03e3e]/30 text-[#101216] dark:text-white'
              : isToday
              ? 'bg-[#101216] text-white border-[#101216] dark:bg-white dark:text-[#101216] dark:border-white'
              : isWeekend
              ? 'bg-[#f2efe9] dark:bg-[#1d2128] border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-white'
              : 'bg-[#faf8f5] dark:bg-[#161922] border-[#e4e0d8] dark:border-[#262b38] text-[#5c6370] dark:text-[#a7adbb]'
          )}
        >
          <span
            className={cn(
              'text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider',
              isToday
                ? 'text-[#ff6b6b] dark:text-[#e03e3e]'
                : isWeekend
                ? 'text-[#e03e3e]'
                : 'text-[#7d8493] dark:text-[#a7adbb]'
            )}
          >
            {weekdayStr.slice(0, 3)}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold tabular-nums leading-none my-0.5 tracking-tight">
            {dateObj.getDate()}
          </span>
          <span
            className={cn(
              'text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate',
              isToday ? 'opacity-90' : 'text-[#7d8493] dark:text-[#a7adbb]'
            )}
          >
            {monthStr}
          </span>
        </div>

        {/* Center: Event Info & Micro-Telemetry */}
        <div className="space-y-2 flex-1 min-w-0">
          {/* Status Chip Row */}
          <div className="flex flex-wrap items-center gap-2">
            {isNextRide && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-[#e03e3e] text-white px-2.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.06em] shadow-2xs"
                title="Prochaine sortie officielle au calendrier"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                Prochaine sortie
              </span>
            )}

            {isToday && !isNextRide && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-[#101216] dark:bg-white text-white dark:text-[#101216] px-2.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.06em]"
                title="Sortie programmée aujourd'hui"
              >
                Aujourd&apos;hui
              </span>
            )}

            {isPast ? (
              <span
                className="inline-flex items-center rounded-full bg-[#f2efe9] dark:bg-[#1d2128] text-[#5c6370] dark:text-[#a7adbb] border border-[#e4e0d8] dark:border-[#262b38] px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold"
                title="Sortie terminée. Débriefings et statistiques disponibles."
              >
                Sortie terminée
              </span>
            ) : (
              !isNextRide && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#e03e3e]/10 text-[#e03e3e] dark:bg-[#e03e3e]/20 dark:text-[#ff8080] border border-[#e03e3e]/20 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.06em]"
                  title={isWeekend ? 'Sortie club officielle' : 'Événement spécial / Randonnée extérieure'}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e03e3e]" />
                  {isWeekend ? 'Sortie Club' : 'Événement'}
                </span>
              )
            )}

            {event.group && (
              <span
                className="inline-flex items-center rounded-full bg-[#f2efe9] dark:bg-[#1d2128] text-[#3a3f4a] dark:text-[#d1d5db] border border-[#e4e0d8] dark:border-[#262b38] px-2.5 py-0.5 text-[10px] sm:text-xs font-medium"
                title={`Peloton : ${event.group}`}
              >
                {event.group}
              </span>
            )}
          </div>

          {/* Location Title */}
          <h3 className="text-base sm:text-lg font-bold text-[#101216] dark:text-white group-hover:text-[#e03e3e] transition-colors leading-snug truncate">
            {event.location}
          </h3>

          {/* Micro-Telemetry Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5c6370] dark:text-[#a7adbb]">
            <span
              className="inline-flex items-center gap-1.5"
              title="Heure de départ du peloton"
            >
              <ClockIcon className="h-3.5 w-3.5 text-[#e03e3e] shrink-0" />
              <span>Départ à <strong className="text-[#101216] dark:text-white font-bold tabular-nums">{event.departure}</strong></span>
            </span>

            {event.distances && (
              <span
                className="inline-flex items-center gap-1.5 tabular-nums"
                title="Distance approximative du parcours officiel"
              >
                <BicycleIcon className="h-3.5 w-3.5 text-[#101216] dark:text-white shrink-0" />
                <strong className="text-[#101216] dark:text-white font-bold">{event.distances} km</strong>
              </span>
            )}

            {event.address && (
              <span
                className="inline-flex items-center gap-1.5 truncate max-w-[220px] sm:max-w-xs md:max-w-sm"
                title={`Point de rassemblement précis : ${event.address}`}
              >
                <MapPinIcon className="h-3.5 w-3.5 text-[#7d8493] shrink-0" />
                <span className="truncate">{event.address}</span>
              </span>
            )}
          </div>

          {/* Alternative Route: Subtle, refined pill instead of screaming alert banner */}
          {event.alternative && (
            <div className="pt-0.5">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#faf8f5] dark:bg-[#1d2128] border border-[#e4e0d8] dark:border-[#262b38] px-2.5 py-1 text-xs text-[#5c6370] dark:text-[#a7adbb]">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                <span className="font-semibold text-[#101216] dark:text-white">Raccourci :</span>
                <span className="truncate max-w-xs sm:max-w-md">{event.alternative}</span>
              </span>
            </div>
          )}
        </div>
      </button>

      {/* Right Deck: Weather & Independent Actions */}
      <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#e4e0d8] dark:border-[#262b38]">
        <div>
          <RideWeatherBadge isoDate={event.isoDate} departure={event.departure} compact={true} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onJumpToMonth && (
            <button
              type="button"
              onClick={() => onJumpToMonth(event.isoDate)}
              className="min-h-[44px] inline-flex items-center gap-1.5 rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] hover:bg-[#f2efe9] dark:hover:bg-[#262b38] text-[#101216] dark:text-white px-3.5 py-2 text-xs font-semibold transition-colors shadow-2xs"
              title={`Afficher le mois complet de ${monthStr} ${y} dans l'agenda`}
              aria-label={`Afficher le mois complet de ${monthStr} ${y} dans l'agenda`}
            >
              <CalendarDaysIcon className="h-4 w-4 text-[#5c6370] dark:text-[#a7adbb]" />
              <span className="hidden sm:inline">Aller au mois</span>
            </button>
          )}

          {event.gpxUrl && (
            <a
              href={event.gpxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] inline-flex items-center gap-1.5 rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] hover:border-[#e03e3e]/40 hover:bg-[#faf8f5] dark:hover:bg-[#1f242d] text-[#101216] dark:text-white px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.06em] transition-all shadow-2xs group/gpx"
              title={`Télécharger le tracé GPX pour ${event.location} (Garmin, Wahoo, Strava)`}
              aria-label={`Télécharger le tracé GPX pour ${event.location}`}
            >
              <ArrowDownTrayIcon className="h-4 w-4 text-[#e03e3e] transition-transform duration-200 group-hover/gpx:translate-y-0.5" />
              <span>Trace GPX</span>
            </a>
          )}

          {attendees.length > 0 && (
            <button
              type="button"
              onClick={() => onSelectEvent(event)}
              className="min-h-[44px] inline-flex items-center gap-1.5 rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#f2efe9] dark:bg-white/5 hover:bg-[#e4e0d8] dark:hover:bg-white/10 px-3 py-2 text-xs font-bold text-[#101216] dark:text-white shadow-2xs transition-colors cursor-pointer"
              title={`${attendees.length} membre${attendees.length > 1 ? 's' : ''} inscrit${attendees.length > 1 ? 's' : ''} au départ. Cliquez pour afficher le peloton.`}
              aria-label={`${attendees.length} cycliste${attendees.length > 1 ? 's' : ''} au départ`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              <UserGroupIcon className="h-3.5 w-3.5 text-[#5c6370] dark:text-[#a7adbb]" />
              <span className="tabular-nums">{attendees.length}</span>
              <span className="hidden sm:inline text-[11px] font-normal text-[#5c6370] dark:text-[#a7adbb]">
                {attendees.length === 1 ? 'inscrit' : 'inscrits'}
              </span>
            </button>
          )}

          {avgRating && (
            <button
              type="button"
              onClick={() => onSelectEvent(event)}
              className="min-h-[44px] inline-flex items-center gap-1.5 rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#f2efe9] dark:bg-white/5 hover:bg-[#e4e0d8] dark:hover:bg-white/10 px-3 py-2 text-xs font-bold text-[#101216] dark:text-white shadow-2xs transition-colors cursor-pointer"
              title={`Note moyenne : ${avgRating}/5 (${reviews.length} ${reviews.length > 1 ? 'débriefings' : 'débriefing'}). Cliquez pour consulter les avis.`}
              aria-label={`Note moyenne : ${avgRating} sur 5 (${reviews.length} débriefings)`}
            >
              <ChatBubbleLeftRightIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
              <span className="tabular-nums">{avgRating}/5</span>
              <span className="hidden sm:inline text-[11px] font-normal text-[#5c6370] dark:text-[#a7adbb]">
                ({reviews.length})
              </span>
            </button>
          )}

          {mounted && isAdmin && (
            <Link
              href={`/admin/events/${event.id}/edit`}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md border border-[#e4e0d8] dark:border-[#262b38] hover:bg-[#f2efe9] dark:hover:bg-[#1d2128] text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white transition-colors shadow-2xs"
              title="Modifier l'événement dans le panneau d'administration"
              aria-label="Modifier l'événement"
            >
              <PencilSquareIcon className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}

export default function CalendarView({
  events,
  attendanceMap = {},
  initialReviewsMap = {},
}: {
  events: CalendarEvent[];
  attendanceMap?: Record<string, AttendeeInfo[]>;
  initialReviewsMap?: Record<string, EventReview[]>;
}) {
  const { isAdmin } = useAuth();
  const mounted = useIsMounted();
  const searchParams = useSearchParams();

  const paramDate = searchParams?.get('date');
  const paramEventId = searchParams?.get('event') || searchParams?.get('eventId');

  const initialSelection = useMemo(() => {
    let targetEvent: CalendarEvent | null = null;
    let initialDate = new Date();

    if (paramEventId) {
      targetEvent = events.find((e) => e.id === paramEventId) || null;
    }
    if (!targetEvent && paramDate) {
      const dateInfo = parseDateInfo(paramDate);
      const targetIso = dateInfo ? dateInfo.isoDate : paramDate;
      targetEvent = events.find((e) => e.isoDate === targetIso) || null;
    }

    if (targetEvent) {
      const [y, m, d] = targetEvent.isoDate.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        initialDate = new Date(y, m - 1, d || 1);
      }
    } else if (paramDate) {
      const dateInfo = parseDateInfo(paramDate);
      if (dateInfo) {
        initialDate = new Date(dateInfo.year, dateInfo.month - 1, dateInfo.day);
      }
    }

    return { initialDate, targetEvent };
  }, [paramDate, paramEventId, events]);

  const [currentDate, setCurrentDate] = useState<Date>(() => initialSelection.initialDate);
  const [viewMode, setViewMode] = useState<ViewMode>('agenda');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(() => initialSelection.targetEvent);
  const [reviewsMap, setReviewsMap] = useState<Record<string, EventReview[]>>(initialReviewsMap);

  const [prevParamKey, setPrevParamKey] = useState(`${paramDate || ''}:${paramEventId || ''}`);
  const currentParamKey = `${paramDate || ''}:${paramEventId || ''}`;

  if (currentParamKey !== prevParamKey) {
    setPrevParamKey(currentParamKey);
    if (initialSelection.targetEvent) {
      setSelectedEvent(initialSelection.targetEvent);
      setCurrentDate(initialSelection.initialDate);
    } else if (paramDate) {
      setCurrentDate(initialSelection.initialDate);
    }
  }

  const handleReviewsUpdated = useCallback((eventId: string, newReviews: EventReview[]) => {
    setReviewsMap((prev) => ({
      ...prev,
      [eventId]: newReviews,
    }));
  }, []);

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

  // Next immediate scheduled event for highlighting
  const nextScheduledEventId = useMemo(() => {
    const future = events
      .filter((e) => e.isoDate >= todayStr)
      .sort((a, b) => a.isoDate.localeCompare(b.isoDate));
    return future.length > 0 ? future[0].id : null;
  }, [events, todayStr]);

  // Group searched events by month for clear scanability
  const groupedSearchedEvents = useMemo(() => {
    if (!isSearching) return [];
    const groups: { monthKey: string; monthLabel: string; events: CalendarEvent[] }[] = [];
    searchedEvents.forEach((ev) => {
      const [y, m] = ev.isoDate.split('-').map(Number);
      const monthKey = `${y}-${m}`;
      const monthLabel = `${MONTH_NAMES[m - 1]} ${y}`;
      let grp = groups.find((g) => g.monthKey === monthKey);
      if (!grp) {
        grp = { monthKey, monthLabel, events: [] };
        groups.push(grp);
      }
      grp.events.push(ev);
    });
    return groups;
  }, [searchedEvents, isSearching]);

  // Base events for count badges (month or search, unfiltered by category)
  const baseEventsForCounts = useMemo(() => {
    if (isSearching) {
      const query = normalizeText(searchQuery);
      return events.filter((e) => {
        if (!e.isoDate) return false;
        const [, m] = e.isoDate.split('-').map(Number);
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
      });
    }

    return events.filter((e) => {
      if (!e.isoDate) return false;
      const [y, m] = e.isoDate.split('-').map(Number);
      return y === year && m - 1 === month;
    });
  }, [events, isSearching, searchQuery, year, month]);

  const filterCounts = useMemo(() => {
    let saturday = 0;
    let sunday = 0;
    let gpx = 0;

    baseEventsForCounts.forEach((e) => {
      const [y, m, d] = e.isoDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      if (dateObj.getDay() === 6) saturday++;
      if (dateObj.getDay() === 0) sunday++;
      if (e.gpxUrl) gpx++;
    });

    return {
      all: baseEventsForCounts.length,
      saturday,
      sunday,
      gpx,
    };
  }, [baseEventsForCounts]);

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
      <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Month Title & Nav */}
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101216] dark:text-white min-w-[200px]">
              {MONTH_NAMES[month]} <span className="text-[#5c6370] dark:text-[#a7adbb] font-normal tabular-nums">{year}</span>
            </h2>

            <div className="inline-flex items-center rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#f2efe9]/60 dark:bg-[#1d2128] p-0.5">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white hover:bg-white dark:hover:bg-[#161922] transition-colors"
                title="Afficher le mois précédent"
                aria-label="Afficher le mois précédent"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goToToday}
                title="Revenir au mois en cours"
                aria-label="Revenir au mois en cours (aujourd'hui)"
                className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-[#101216] dark:text-white hover:bg-white dark:hover:bg-[#161922] rounded transition-colors flex items-center justify-center"
              >
                Aujourd&apos;hui
              </button>
              <button
                type="button"
                onClick={goToNextMonth}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white hover:bg-white dark:hover:bg-[#161922] transition-colors"
                title="Afficher le mois suivant"
                aria-label="Afficher le mois suivant"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Side: View Switcher & Global Search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search input across all months */}
            <div className="relative flex-1 sm:w-72 sm:flex-none">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5c6370] dark:text-[#a7adbb]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une destination, distance..."
                aria-label="Rechercher une sortie par destination, commune, distance ou mois"
                className="w-full min-h-[44px] pl-10 pr-10 py-2 text-xs rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#1d2128] focus:bg-white dark:focus:bg-[#161922] focus:outline-none focus:border-[#e03e3e] transition-colors text-[#101216] dark:text-white placeholder:text-[#5c6370] dark:placeholder:text-[#a7adbb]"
              />
              {isSearching && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="min-h-[44px] min-w-[44px] absolute right-0 top-0 flex items-center justify-center text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white"
                  title="Effacer la recherche"
                  aria-label="Effacer le texte de recherche"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="inline-flex items-center rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#f2efe9]/70 dark:bg-[#1d2128] p-1">
              <button
                type="button"
                onClick={() => setViewMode('agenda')}
                aria-label="Afficher la vue Agenda chronologique"
                title="Vue Agenda chronologique"
                className={cn(
                  'min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded text-xs font-semibold transition-all',
                  viewMode === 'agenda' || isSearching
                    ? 'bg-white dark:bg-[#161922] text-[#101216] dark:text-white shadow-xs'
                    : 'text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white'
                )}
              >
                <ListBulletIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Agenda</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Afficher la vue Grille mensuelle"
                title="Vue Grille mensuelle"
                className={cn(
                  'min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded text-xs font-semibold transition-all',
                  viewMode === 'grid' && !isSearching
                    ? 'bg-white dark:bg-[#161922] text-[#101216] dark:text-white shadow-xs'
                    : 'text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white'
                )}
              >
                <Squares2X2Icon className="h-4 w-4" />
                <span className="hidden sm:inline">Grille</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#e4e0d8] dark:border-[#262b38]">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] mr-1">
            Filtrer :
          </span>

          <button
            type="button"
            onClick={() => setFilterType('all')}
            title="Afficher toutes les sorties disponibles"
            className={cn(
              'min-h-[44px] px-3.5 sm:px-4 py-2 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer',
              filterType === 'all'
                ? 'bg-[#101216] dark:bg-white text-white dark:text-[#101216]'
                : 'bg-[#f2efe9] dark:bg-[#1d2128] text-[#5c6370] dark:text-[#a7adbb] hover:bg-[#e4e0d8] dark:hover:bg-[#262b38] hover:text-[#101216] dark:hover:text-white'
            )}
          >
            <span>Toutes</span>
            <span className="tabular-nums font-bold opacity-85">({filterCounts.all})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('saturday')}
            title="Filtrer les sorties du samedi (Route uniquement)"
            className={cn(
              'min-h-[44px] px-3.5 sm:px-4 py-2 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer',
              filterType === 'saturday'
                ? 'bg-[#e03e3e] text-white shadow-2xs'
                : 'bg-[#f2efe9] dark:bg-[#1d2128] text-[#5c6370] dark:text-[#a7adbb] hover:bg-[#e4e0d8] dark:hover:bg-[#262b38] hover:text-[#101216] dark:hover:text-white'
            )}
          >
            <span>Samedi (Route)</span>
            <span className="tabular-nums font-bold opacity-85">({filterCounts.saturday})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('sunday')}
            title="Filtrer les sorties dominicales (Route & VTT)"
            className={cn(
              'min-h-[44px] px-3.5 sm:px-4 py-2 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer',
              filterType === 'sunday'
                ? 'bg-[#e03e3e] text-white shadow-2xs'
                : 'bg-[#f2efe9] dark:bg-[#1d2128] text-[#5c6370] dark:text-[#a7adbb] hover:bg-[#e4e0d8] dark:hover:bg-[#262b38] hover:text-[#101216] dark:hover:text-white'
            )}
          >
            <span>Dimanche (Route &amp; VTT)</span>
            <span className="tabular-nums font-bold opacity-85">({filterCounts.sunday})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('gpx')}
            title="Afficher uniquement les sorties accompagnées d'un tracé GPX"
            className={cn(
              'min-h-[44px] inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer',
              filterType === 'gpx'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-[#f2efe9] dark:bg-[#1d2128] text-[#5c6370] dark:text-[#a7adbb] hover:bg-[#e4e0d8] dark:hover:bg-[#262b38] hover:text-[#101216] dark:hover:text-white'
            )}
          >
            <MapIcon className="h-3.5 w-3.5" />
            <span>Avec Tracé GPX</span>
            <span className="tabular-nums font-bold opacity-85">({filterCounts.gpx})</span>
          </button>
        </div>
      </div>

      {/* ──── Active Search Mode: Global Results Across All Months ──── */}
      {isSearching ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-white dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-[#e03e3e] animate-pulse shrink-0" />
              <p className="text-xs sm:text-sm text-[#101216] dark:text-white">
                Recherche globale sur <strong className="font-bold">toute la saison</strong> pour « <span className="font-semibold text-[#e03e3e]">{searchQuery}</span> »
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb] tabular-nums">
                {searchedEvents.length} résultat{searchedEvents.length !== 1 ? 's' : ''} trouvé{searchedEvents.length !== 1 ? 's' : ''}
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="min-h-[44px] inline-flex items-center gap-1 text-xs font-semibold text-[#e03e3e] hover:underline cursor-pointer"
              >
                <span>Effacer</span>
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {groupedSearchedEvents.length > 0 ? (
            <div className="space-y-8">
              {groupedSearchedEvents.map((grp) => (
                <div key={grp.monthKey} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#e4e0d8] dark:border-[#262b38] pb-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#101216] dark:text-white flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#e03e3e]" />
                      <span>{grp.monthLabel}</span>
                    </h3>
                    <span className="text-xs font-semibold text-[#5c6370] dark:text-[#a7adbb] tabular-nums">
                      {grp.events.length} {grp.events.length === 1 ? 'sortie' : 'sorties'}
                    </span>
                  </div>

                  <ul className="space-y-4" role="list">
                    {grp.events.map((event) => (
                      <AgendaItem
                        key={event.id}
                        event={event}
                        attendees={attendanceMap[event.id] || []}
                        reviews={reviewsMap[event.id] || []}
                        isNextRide={event.id === nextScheduledEventId}
                        isToday={event.isoDate === todayStr}
                        isPast={isEventDone(event.isoDate, event.departure)}
                        onSelectEvent={setSelectedEvent}
                        onJumpToMonth={handleJumpToMonth}
                        isAdmin={isAdmin}
                        mounted={mounted}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-10 sm:p-12 text-center space-y-3 shadow-2xs">
              <CalendarDaysIcon className="mx-auto h-10 w-10 text-[#5c6370] dark:text-[#a7adbb]" />
              <h3 className="text-base font-bold text-[#101216] dark:text-white">
                Aucune sortie ne correspond à votre recherche
              </h3>
              <p className="text-xs sm:text-sm text-[#5c6370] dark:text-[#a7adbb] max-w-md mx-auto leading-relaxed">
                Aucune sortie ne correspond à « <strong className="text-[#101216] dark:text-white font-semibold">{searchQuery}</strong> » sur l&apos;ensemble de la saison 2026. Essayez de chercher un nom de commune (ex : Villers, Namur, Wavre), une distance en km, ou vérifiez l&apos;orthographe.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="min-h-[44px] inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span>Effacer la recherche</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ──── Regular Month View (Grid or Agenda) ──── */
        <>
          {viewMode === 'grid' && (
            <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] shadow-xs overflow-hidden">
              {/* Weekday Header Row */}
              <div className="grid grid-cols-7 border-b border-[#e4e0d8] dark:border-[#262b38] bg-[#f2efe9] dark:bg-[#1d2128] text-center text-xs font-bold uppercase tracking-[0.06em] text-[#5c6370] dark:text-[#a7adbb]">
                {WEEKDAY_NAMES.map((wd, i) => (
                  <div
                    key={i}
                    className={cn(
                      'py-3 border-r border-[#e4e0d8] dark:border-[#262b38] last:border-r-0',
                      wd.isWeekend ? 'text-[#e03e3e] bg-[#ede8e1] dark:bg-[#222734]' : ''
                    )}
                  >
                    <span className="hidden sm:inline">{wd.full}</span>
                    <span className="sm:hidden">{wd.short}</span>
                  </div>
                ))}
              </div>

              {/* Month Calendar Grid (7 columns) */}
              <div className="grid grid-cols-7 divide-x divide-y divide-[#e4e0d8] dark:divide-[#262b38]">
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
                            ? 'bg-[#fbf9f6] dark:bg-[#161922]/90'
                            : 'bg-white dark:bg-[#161922]'
                          : 'bg-[#f5f3ef]/60 dark:bg-[#0a0c10]/50 opacity-40 select-none'
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
                              ? 'text-[#101216] dark:text-white'
                              : 'text-[#5c6370] dark:text-[#a7adbb]'
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
                              className="w-full text-left rounded p-1.5 bg-[#f2efe9] dark:bg-[#1d2128] text-[#101216] dark:text-white border border-[#e4e0d8] dark:border-[#262b38] hover:bg-[#e03e3e] hover:text-white hover:border-[#e03e3e] transition-colors group/ev block shadow-2xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#e03e3e]"
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
                                <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
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
                  {monthEvents.map((event) => (
                    <AgendaItem
                      key={event.id}
                      event={event}
                      attendees={attendanceMap[event.id] || []}
                      reviews={reviewsMap[event.id] || []}
                      isNextRide={event.id === nextScheduledEventId}
                      isToday={event.isoDate === todayStr}
                      isPast={isEventDone(event.isoDate, event.departure)}
                      onSelectEvent={setSelectedEvent}
                      isAdmin={isAdmin}
                      mounted={mounted}
                    />
                  ))}
                </ul>
              ) : (
                <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-10 sm:p-12 text-center space-y-3 shadow-2xs">
                  <CalendarDaysIcon className="mx-auto h-10 w-10 text-[#5c6370] dark:text-[#a7adbb]" />
                  <h3 className="text-base font-bold text-[#101216] dark:text-white">
                    {filterType !== 'all' ? 'Aucune sortie pour ce filtre' : 'Aucune sortie programmée ce mois-ci'}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5c6370] dark:text-[#a7adbb] max-w-md mx-auto leading-relaxed">
                    {filterType !== 'all'
                      ? `Aucune sortie ne correspond au filtre sélectionné pour ${MONTH_NAMES[month]} ${year}. Réinitialisez les filtres pour consulter l'ensemble des rendez-vous.`
                      : `Aucun rassemblement n'est encore inscrit au calendrier officiel pour ${MONTH_NAMES[month]} ${year}.`}
                  </p>
                  {filterType !== 'all' ? (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setFilterType('all')}
                        className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#1d2128] hover:border-[#e03e3e] text-xs font-semibold text-[#e03e3e] transition-colors cursor-pointer"
                      >
                        Afficher toutes les sorties de {MONTH_NAMES[month]} {year}
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={goToToday}
                        className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-[#101216] dark:bg-white text-white dark:text-[#101216] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Revenir au mois en cours
                      </button>
                    </div>
                  )}
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
        reviews={selectedEvent ? reviewsMap[selectedEvent.id] || [] : []}
        onReviewsUpdated={(newReviews) => {
          if (selectedEvent) {
            handleReviewsUpdated(selectedEvent.id, newReviews);
          }
        }}
      />
    </div>
  );
}

