import type { CalendarEvent, PollResponse } from '@/app/types';
import type { RideWeather } from '@/app/lib/weather';

const CARDINAL_NAMES: Record<string, string> = {
  N: 'nord',
  NE: 'nord-est',
  E: 'est',
  SE: 'sud-est',
  S: 'sud',
  SO: 'sud-ouest',
  O: 'ouest',
  NO: 'nord-ouest',
};

/** Parses a YYYY-MM-DD date as a local calendar date (never through UTC). */
export function parseIsoDate(isoDate: string): Date | null {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export interface DepartureDateParts {
  weekday: string;
  dayMonth: string;
  day: string;
  monthShort: string;
  weekdayShort: string;
}

export function departureDateParts(isoDate: string): DepartureDateParts {
  const date = parseIsoDate(isoDate);
  if (!date) {
    return { weekday: '', dayMonth: isoDate, day: '', monthShort: '', weekdayShort: '' };
  }
  const weekday = date.toLocaleDateString('fr-BE', { weekday: 'long' });
  const month = date.toLocaleDateString('fr-BE', { month: 'long' });
  const monthShort = date.toLocaleDateString('fr-BE', { month: 'short' }).replace('.', '');
  const weekdayShort = date.toLocaleDateString('fr-BE', { weekday: 'short' }).replace('.', '');
  return {
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    dayMonth: `${date.getDate()} ${month}`,
    day: String(date.getDate()),
    monthShort,
    weekdayShort,
  };
}

/**
 * The club's riding habit: set off into the wind, come home with it at your back.
 */
export function windAdvice(
  weather: Pick<RideWeather, 'windSpeed' | 'windCardinal'> | null | undefined
): string | null {
  if (!weather) return null;
  if (weather.windSpeed < 10) return 'Vent faible : tous les parcours se valent.';
  const toward = CARDINAL_NAMES[weather.windCardinal] ?? weather.windCardinal.toLowerCase();
  return `Partir face au vent, vers le ${toward}, et rentrer vent dans le dos.`;
}

export function cardinalName(code: string): string {
  return CARDINAL_NAMES[code] ?? code;
}

export interface PollTally {
  saturday: number;
  sunday: number;
  both: number;
  absent: number;
  riders: number;
  total: number;
  byGroup: Record<'A' | 'B' | 'C' | 'VTT' | 'Autre', number>;
}

export function tallyPoll(responses: PollResponse[]): PollTally {
  const tally: PollTally = {
    saturday: 0,
    sunday: 0,
    both: 0,
    absent: 0,
    riders: 0,
    total: responses.length,
    byGroup: { A: 0, B: 0, C: 0, VTT: 0, Autre: 0 },
  };
  for (const r of responses) {
    if (r.dayChoice === 'absent') {
      tally.absent += 1;
      continue;
    }
    tally.riders += 1;
    if (r.dayChoice === 'samedi' || r.dayChoice === 'les-deux') tally.saturday += 1;
    if (r.dayChoice === 'dimanche' || r.dayChoice === 'les-deux') tally.sunday += 1;
    if (r.dayChoice === 'les-deux') tally.both += 1;
    const group = r.groupChoice?.replace('Groupe ', '') as keyof PollTally['byGroup'];
    if (group in tally.byGroup) tally.byGroup[group] += 1;
    else tally.byGroup.Autre += 1;
  }
  return tally;
}

export function localTodayIso(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function upcomingEvents(
  events: CalendarEvent[],
  todayIso: string,
  limit = 6
): CalendarEvent[] {
  return events
    .filter((e) => e.isoDate && e.isoDate >= todayIso)
    .sort(
      (a, b) =>
        a.isoDate.localeCompare(b.isoDate) || (a.departure || '').localeCompare(b.departure || '')
    )
    .slice(0, limit);
}

export function formatDistance(distances?: string): string | null {
  if (!distances) return null;
  const trimmed = distances.trim();
  if (!trimmed) return null;
  return /km/i.test(trimmed) ? trimmed : `${trimmed} km`;
}

/** Replaces machine ISO dates in auto-generated poll titles with a French date. */
export function humanizePollTitle(title: string): string {
  return title
    .replace(/(\d{4})-(\d{2})-(\d{2})/g, (_, y: string, m: string, d: string) => {
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      return date.toLocaleDateString('fr-BE', { day: 'numeric', month: 'long' });
    })
    .replace(/weekend/gi, 'week-end')
    .replace(/\s+-\s+/g, ' · ');
}

/** Expands the club's shorthand for its meeting point ("FECHERE") into its place name. */
export function humanizeAddress(address?: string): string | null {
  if (!address) return null;
  const trimmed = address.trim();
  if (!trimmed) return null;
  if (/^f[ée]ch[èe]re$/i.test(trimmed)) return 'Place de la Féchère';
  return trimmed;
}
