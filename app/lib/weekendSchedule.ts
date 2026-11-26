/** Last Sunday of a month (0-based) as a day of month. */
function lastSunday(year: number, month: number): number {
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  return lastDay.getUTCDate() - lastDay.getUTCDay();
}

/** Belgian summer time (Europe/Brussels DST): last Sunday of March to last Sunday of October, 01:00 UTC. */
export function isSummerTime(now: Date): boolean {
  const y = now.getUTCFullYear();
  return (
    now.getTime() >= Date.UTC(y, 2, lastSunday(y, 2), 1) &&
    now.getTime() < Date.UTC(y, 9, lastSunday(y, 9), 1)
  );
}

export interface WeekendSchedule {
  saturday: { value: string; detail: string };
  sunday: { value: string; detail: string };
}

/**
 * Standing weekend departures. Summer: Saturday morning (calendar time when given, else 8h30)
 * with a 13h00 alternative. Winter: Saturday 13h00 only. Sunday 9h00 all year.
 */
export function weekendSchedule(now: Date, saturdayEventDeparture?: string): WeekendSchedule {
  const sunday = { value: '9h00', detail: '· Route & VTT' };
  if (!isSummerTime(now)) return { saturday: { value: '13h00', detail: '· Route' }, sunday };
  return {
    saturday: { value: saturdayEventDeparture?.trim() || '8h30', detail: '· Route, ou 13h00' },
    sunday,
  };
}
