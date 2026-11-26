import { CalendarEvent } from '../types';

/**
 * Agenda order (#214): upcoming rides first, soonest on top (so the next ride
 * leads), then past rides from the most recent to the oldest.
 * `todayStr` is YYYY-MM-DD; a ride today counts as upcoming, like the
 * "Prochaine sortie" highlight.
 */
export function sortAgendaEvents(events: CalendarEvent[], todayStr: string): CalendarEvent[] {
  const upcoming = events.filter((e) => e.isoDate >= todayStr).sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  const past = events.filter((e) => e.isoDate < todayStr).sort((a, b) => b.isoDate.localeCompare(a.isoDate));
  return [...upcoming, ...past];
}
