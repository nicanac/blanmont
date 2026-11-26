import type { CalendarEvent } from '../types';

/**
 * Agenda order: rides still to come first (soonest on top), then finished rides
 * (most recent first, oldest last). Same-day rides keep their incoming order.
 */
export function orderAgendaEvents(
  events: CalendarEvent[],
  isDone: (event: CalendarEvent) => boolean,
): CalendarEvent[] {
  const upcoming = events.filter((e) => !isDone(e)).sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  const past = events.filter(isDone).sort((a, b) => b.isoDate.localeCompare(a.isoDate));
  return [...upcoming, ...past];
}
