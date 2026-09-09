import { getCalendarEvents } from './firebase/calendar';
import { getAllRides } from './firebase/saturday-ride';
import { getTrace } from './firebase/traces';
import { formatFrenchDate, getTodayIso } from '../utils/date';
import { CalendarEvent, SaturdayRide, Trace } from '../types';

export interface SaturdaySortieInfo {
  found: boolean;
  isoDate: string;
  formattedDate: string;
  location: string;
  departure: string;
  distancesRaw?: string;
  distanceList: number[];
  distanceOptions: string[];
  suggestedQuestionTitle: string;
  suggestedTitle: string;
  suggestedDescription: string;
  address?: string;
  remarks?: string;
  gpxUrl?: string;
  nextAvailableSaturdayIso?: string;
  source: 'calendar' | 'saturday-ride' | 'both' | 'none';
}

/**
 * Extracts distance numbers from raw distance strings (e.g. "70-90", "65-85-105", "80, 110 km").
 */
export function parseDistanceValues(distanceStr?: string): number[] {
  if (!distanceStr) return [];
  // Match 2 to 3 digit numbers (e.g. 60, 75, 90, 120)
  const matches = distanceStr.match(/\b\d{2,3}\b/g);
  if (!matches) return [];
  const numbers = matches
    .map(Number)
    .filter((n) => n >= 20 && n <= 350); // Sensible cycling distance filter in km
  // Deduplicate and sort ascending
  return Array.from(new Set(numbers)).sort((a, b) => a - b);
}

/**
 * Generates clear and idiomatic French labels for QCM poll options based on parsed distances.
 */
export function buildDistanceOptions(distanceNumbers: number[], rawStr?: string): string[] {
  if (distanceNumbers.length === 2) {
    return [
      `Parcours court (~${distanceNumbers[0]} km)`,
      `Parcours long (~${distanceNumbers[1]} km)`,
    ];
  }

  if (distanceNumbers.length === 3) {
    return [
      `Petit parcours (~${distanceNumbers[0]} km)`,
      `Moyen parcours (~${distanceNumbers[1]} km)`,
      `Grand parcours (~${distanceNumbers[2]} km)`,
    ];
  }

  if (distanceNumbers.length > 3) {
    return distanceNumbers.map((d) => `Parcours ~${d} km`);
  }

  if (distanceNumbers.length === 1) {
    return [
      `Parcours officiel (~${distanceNumbers[0]} km)`,
      `Option raccourcie`,
    ];
  }

  // Fallback if raw text exists but didn't parse clean numbers
  if (rawStr && rawStr.trim().length > 0) {
    const parts = rawStr.split(/[-,\/]/).map((s) => s.trim()).filter(Boolean);
    if (parts.length > 1) {
      return parts.map((p) => (p.toLowerCase().includes('km') ? p : `${p} km`));
    }
  }

  // Standard defaults
  return [
    'Option courte (~70 km)',
    'Option moyenne (~90 km)',
    'Option longue (~115 km)',
  ];
}

/**
 * Finds the upcoming Saturday ISO date (YYYY-MM-DD) from today.
 */
export function getUpcomingSaturdayIso(): string {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sun, 6 = Sat
  const daysUntilSaturday = (6 - currentDay + 7) % 7;
  const sat = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday)
  );
  const y = sat.getFullYear();
  const m = String(sat.getMonth() + 1).padStart(2, '0');
  const d = String(sat.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Retrieves details of the Saturday ride for a specific date (or the upcoming Saturday).
 * Gathers information from both CalendarEvent and SaturdayRide entries.
 */
export async function getSaturdaySortieDetails(
  targetDate?: string
): Promise<SaturdaySortieInfo> {
  const isoDate = targetDate || getUpcomingSaturdayIso();
  const todayIso = getTodayIso();

  // 1. Fetch Calendar events and Saturday rides in parallel
  const [allEvents, allRides] = await Promise.all([
    getCalendarEvents().catch(() => [] as CalendarEvent[]),
    getAllRides().catch(() => [] as SaturdayRide[]),
  ]);

  // Find exact matches for this date
  const calendarEvent = allEvents.find((e) => e.isoDate === isoDate);
  const saturdayRide = allRides.find((r) => r.date === isoDate);

  // Find candidate traces if available on SaturdayRide
  let candidateTraces: Trace[] = [];
  if (saturdayRide && saturdayRide.candidateTraceIds && saturdayRide.candidateTraceIds.length > 0) {
    const tracePromises = saturdayRide.candidateTraceIds.map((id) =>
      getTrace(id).catch(() => null)
    );
    const resolved = await Promise.all(tracePromises);
    candidateTraces = resolved.filter((t): t is Trace => Boolean(t));
  }

  // Find next available upcoming Saturday in calendar if current date has no event
  let nextAvailableSaturdayIso: string | undefined;
  if (!calendarEvent && !saturdayRide) {
    const futureSaturdayEvents = allEvents
      .filter((e) => {
        if (!e.isoDate || e.isoDate < todayIso) return false;
        // Check if date is a Saturday
        const parts = e.isoDate.split('-').map(Number);
        if (parts.length < 3) return false;
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.getDay() === 6;
      })
      .sort((a, b) => a.isoDate.localeCompare(b.isoDate));

    if (futureSaturdayEvents.length > 0) {
      nextAvailableSaturdayIso = futureSaturdayEvents[0].isoDate;
    }
  }

  const found = Boolean(calendarEvent || saturdayRide);
  let source: 'calendar' | 'saturday-ride' | 'both' | 'none' = 'none';
  if (calendarEvent && saturdayRide) source = 'both';
  else if (calendarEvent) source = 'calendar';
  else if (saturdayRide) source = 'saturday-ride';

  const formattedDate = formatFrenchDate(isoDate, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const location = calendarEvent?.location || 'Blanmont';
  const departure = calendarEvent?.departure || '8h30';
  const address = calendarEvent?.address || '';
  const remarks = calendarEvent?.remarks || '';
  const gpxUrl = calendarEvent?.gpxUrl || '';

  // Parse distances: either from candidate traces or from calendar event
  let distanceList: number[] = [];
  let distanceOptions: string[] = [];
  let distancesRaw = calendarEvent?.distances;

  if (candidateTraces.length > 0) {
    distanceOptions = candidateTraces.map((t) => {
      const dist = Math.round(t.distance);
      const elev = t.elevation ? ` • ${t.elevation}m D+` : '';
      return `${t.name} (~${dist} km${elev})`;
    });
    distanceList = candidateTraces.map((t) => Math.round(t.distance));
    distancesRaw = candidateTraces.map((t) => `${Math.round(t.distance)}km`).join(', ');
  } else if (distancesRaw) {
    distanceList = parseDistanceValues(distancesRaw);
    distanceOptions = buildDistanceOptions(distanceList, distancesRaw);
  } else {
    distanceOptions = buildDistanceOptions([]);
  }

  // Build suggested title
  const suggestedTitle = `Sortie du Weekend - ${isoDate} (${location})`;

  // Build suggested description
  const descriptionLines: string[] = [];
  descriptionLines.push(
    `Sortie officielle du club au départ de ${location}${address ? ` (${address})` : ''} à ${departure}.`
  );

  if (distancesRaw) {
    const formattedDist = distancesRaw.toLowerCase().includes('km')
      ? distancesRaw
      : `${distancesRaw} km`;
    descriptionLines.push(`Distances prévues au calendrier : ${formattedDist}.`);
  }

  if (remarks) {
    descriptionLines.push(`Remarques : ${remarks}`);
  }

  descriptionLines.push(
    `\nIndiquez vos disponibilités et votre groupe de niveau pour les sorties de ce weekend !`
  );

  const suggestedDescription = descriptionLines.join('\n');
  const suggestedQuestionTitle = 'Option de distance / parcours (Samedi)';

  return {
    found,
    isoDate,
    formattedDate,
    location,
    departure,
    distancesRaw,
    distanceList,
    distanceOptions,
    suggestedQuestionTitle,
    suggestedTitle,
    suggestedDescription,
    address,
    remarks,
    gpxUrl,
    nextAvailableSaturdayIso,
    source,
  };
}
