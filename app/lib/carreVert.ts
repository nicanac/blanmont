import { CalendarEvent } from '@/app/types';
import { LeaderboardEntry } from './firebase/leaderboard';
import { EventAttendance } from './firebase/attendance';

export interface ParsedDateInfo {
  year: number;
  month: number;
  day: number;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  isoDate: string; // YYYY-MM-DD
  displayDate: string; // D/M/YYYY
  isWeekend: boolean;
  weekendKey: string; // YYYY-MM-DD of the Saturday for this weekend
  rideKey: string; // "weekend:YYYY-MM-DD" or "weekday:YYYY-MM-DD"
}

export interface MemberCarreStats {
  carres: number; // Total Carré Vert points (1 per weekend max + 1 per weekday)
  physicalRides: number; // Total number of individual dates attended
  weekendCarres: number; // Number of unique weekends attended
  weekdayCarres: number; // Number of unique weekday dates attended
  dates: string[]; // Sorted display dates (e.g., "3/1/2026")
  isoDates: string[]; // Sorted ISO dates (e.g., "2026-01-03")
}

/**
 * Parses a date string in various formats (YYYY-MM-DD, DD/MM/YYYY, D/M/YYYY, DD/MM)
 * using UTC to avoid any timezone/DST shift issues.
 */
export function parseDateInfo(dateStr: string, defaultYear: number = new Date().getFullYear()): ParsedDateInfo | null {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const trimmed = dateStr.trim();
  let year = defaultYear;
  let month = 1;
  let day = 1;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    // ISO format: YYYY-MM-DD
    const parts = trimmed.split('-').map(Number);
    year = parts[0];
    month = parts[1];
    day = parts[2];
  } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    // French format with year: DD/MM/YYYY
    const parts = trimmed.split('/').map(Number);
    day = parts[0];
    month = parts[1];
    year = parts[2];
  } else if (/^\d{1,2}\/\d{1,2}$/.test(trimmed)) {
    // Short French format: DD/MM
    const parts = trimmed.split('/').map(Number);
    day = parts[0];
    month = parts[1];
  } else {
    // Try standard Date parsing as fallback
    const parsed = new Date(trimmed);
    if (isNaN(parsed.getTime())) return null;
    year = parsed.getUTCFullYear();
    month = parsed.getUTCMonth() + 1;
    day = parsed.getUTCDate();
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const utcDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = utcDate.getUTCDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const displayDate = `${day}/${month}/${year}`;

  let weekendKey = '';
  if (isWeekend) {
    if (dayOfWeek === 6) {
      // Saturday: this is the Saturday of the weekend
      weekendKey = isoDate;
    } else {
      // Sunday: Saturday is 1 day earlier
      const sat = new Date(utcDate.getTime() - 86400000);
      const satYear = sat.getUTCFullYear();
      const satMonth = sat.getUTCMonth() + 1;
      const satDay = sat.getUTCDate();
      weekendKey = `${satYear}-${String(satMonth).padStart(2, '0')}-${String(satDay).padStart(2, '0')}`;
    }
  }

  const rideKey = isWeekend ? `weekend:${weekendKey}` : `weekday:${isoDate}`;

  return {
    year,
    month,
    day,
    dayOfWeek,
    isoDate,
    displayDate,
    isWeekend,
    weekendKey,
    rideKey,
  };
}

/**
 * Checks if a date string is on a weekend (Saturday or Sunday).
 */
export function isWeekendDate(dateStr: string, defaultYear?: number): boolean {
  const info = parseDateInfo(dateStr, defaultYear);
  return info ? info.isWeekend : false;
}

/**
 * Returns the unique weekend key (Saturday's ISO date) for any weekend date.
 */
export function getWeekendKey(dateStr: string, defaultYear?: number): string | null {
  const info = parseDateInfo(dateStr, defaultYear);
  return info && info.isWeekend ? info.weekendKey : null;
}

/**
 * Calculates Carré Vert stats from an array of date strings.
 * 
 * Rules:
 * - Weekend rides (Saturday & Sunday of the same weekend) count for 1 Carré Vert total.
 * - Weekday rides (Monday to Friday, including holidays) count for 1 Carré Vert each.
 * - Both Saturday and Sunday attendances are preserved in dates / physicalRides.
 */
export function calculateMemberCarres(dates: string[], year?: number): MemberCarreStats {
  if (!dates || !Array.isArray(dates) || dates.length === 0) {
    return {
      carres: 0,
      physicalRides: 0,
      weekendCarres: 0,
      weekdayCarres: 0,
      dates: [],
      isoDates: [],
    };
  }

  const attendedWeekends = new Set<string>();
  const attendedWeekdays = new Set<string>();
  const uniqueIsoDates = new Set<string>();

  dates.forEach((dateStr) => {
    const info = parseDateInfo(dateStr);
    if (!info) return;

    if (year !== undefined && info.year !== year) {
      return;
    }

    uniqueIsoDates.add(info.isoDate);

    if (info.isWeekend) {
      attendedWeekends.add(info.weekendKey);
    } else {
      attendedWeekdays.add(info.isoDate);
    }
  });

  const sortedIsoDates = Array.from(uniqueIsoDates).sort();
  const sortedDisplayDates = sortedIsoDates.map((iso) => {
    const [y, m, d] = iso.split('-');
    return `${parseInt(d, 10)}/${parseInt(m, 10)}/${y}`;
  });

  const weekendCarres = attendedWeekends.size;
  const weekdayCarres = attendedWeekdays.size;
  const carres = weekendCarres + weekdayCarres;

  return {
    carres,
    physicalRides: sortedIsoDates.length,
    weekendCarres,
    weekdayCarres,
    dates: sortedDisplayDates,
    isoDates: sortedIsoDates,
  };
}

/**
 * Counts the total possible Carré Vert rides in a given year from calendar events.
 * 
 * Rules:
 * - A weekend with at least 1 calendar event counts as 1 possible Carré Vert.
 * - Each weekday date with at least 1 calendar event counts as 1 possible Carré Vert.
 * - For past fidelity calculations, only events up to today (or with recorded attendance) are counted.
 */
export function getPossibleCarresCount(
  events: CalendarEvent[],
  year: number,
  options?: {
    maxIsoDate?: string;
    includeOnlyPastOrAttended?: boolean;
    allAttendance?: EventAttendance[];
  }
): number {
  if (!events || events.length === 0) return 0;

  const now = new Date();
  const currentYear = now.getFullYear();
  const todayISO = now.toISOString().split('T')[0];
  const startOfYear = `${year}-01-01`;
  const endOfYear = `${year}-12-31`;

  // Find all event IDs with recorded attendance
  const attendedEventIds = new Set<string>();
  if (options?.allAttendance) {
    options.allAttendance.forEach((att) => {
      if (att.members && Object.keys(att.members).length > 0) {
        attendedEventIds.add(att.eventId);
      }
    });
  }

  const possibleWeekends = new Set<string>();
  const possibleWeekdays = new Set<string>();

  events.forEach((event) => {
    if (!event.isoDate) return;
    if (event.isoDate < startOfYear || event.isoDate > endOfYear) return;

    if (options?.maxIsoDate && event.isoDate > options.maxIsoDate) {
      return;
    }

    if (options?.includeOnlyPastOrAttended && year === currentYear) {
      const isPast = event.isoDate <= todayISO;
      const hasAttendance = attendedEventIds.has(event.id);
      if (!isPast && !hasAttendance) {
        return;
      }
    }

    const info = parseDateInfo(event.isoDate);
    if (!info || info.year !== year) return;

    if (info.isWeekend) {
      possibleWeekends.add(info.weekendKey);
    } else {
      possibleWeekdays.add(info.isoDate);
    }
  });

  return possibleWeekends.size + possibleWeekdays.size;
}

/**
 * Calculates LeaderboardEntry items from real-time attendance records with fallback to legacy dates.
 * 
 * Ensures:
 * 1. Sunday participation is recorded and visible in the member's dates history.
 * 2. Only 1 Carré Vert point is awarded per weekend even if both Saturday and Sunday were attended.
 * 3. Weekday participations (holidays, public holidays, club rides) each award 1 Carré Vert point.
 * 4. Year filtering is properly respected so switching years correctly shows that year's data.
 */
export function calculateLeaderboardFromAttendance(
  entries: LeaderboardEntry[],
  events: CalendarEvent[],
  allAttendance: EventAttendance[],
  year: number
): LeaderboardEntry[] {
  // Build lookup of eventId -> event isoDate
  const eventDateMap = new Map<string, string>();
  events.forEach((evt) => {
    if (evt.id && evt.isoDate) {
      eventDateMap.set(evt.id, evt.isoDate);
    }
  });

  // Build memberId -> list of attended dates for the target year from attendance collection
  const memberAttendanceDates = new Map<string, string[]>();
  allAttendance.forEach((att) => {
    if (!att.members) return;

    // Use isoDate on attendance record or look it up from event
    const isoDate = att.isoDate || eventDateMap.get(att.eventId);
    if (!isoDate) return;

    const info = parseDateInfo(isoDate);
    if (!info || info.year !== year) return;

    Object.keys(att.members).forEach((memberId) => {
      const existing = memberAttendanceDates.get(memberId) || [];
      existing.push(info.isoDate);
      memberAttendanceDates.set(memberId, existing);
    });
  });

  return entries
    .map((entry) => {
      const attendanceDates = memberAttendanceDates.get(entry.id);
      const hasAttendanceForYear = attendanceDates !== undefined && attendanceDates.length > 0;

      let stats: MemberCarreStats;

      if (hasAttendanceForYear) {
        // Compute from attendance records
        stats = calculateMemberCarres(attendanceDates, year);
      } else {
        // Fall back to legacy entry.dates array
        stats = calculateMemberCarres(entry.dates || [], year);
      }

      return {
        ...entry,
        rides: stats.carres,
        dates: stats.dates,
      };
    })
    .sort((a, b) => b.rides - a.rides);
}
