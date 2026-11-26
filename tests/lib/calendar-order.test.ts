import { describe, it, expect } from 'vitest';
import { sortAgendaEvents } from '@/app/lib/calendar-order';
import { CalendarEvent } from '@/app/types';

const ev = (isoDate: string) => ({ id: isoDate, isoDate }) as CalendarEvent;
const order = (dates: string[], today: string) => sortAgendaEvents(dates.map(ev), today).map((e) => e.isoDate);

describe('sortAgendaEvents', () => {
  it('puts the next ride on top, then later rides, then past rides newest first', () => {
    expect(order(['2026-11-01', '2026-11-29', '2026-11-08', '2026-11-30', '2026-11-22'], '2026-11-26')).toEqual([
      '2026-11-29',
      '2026-11-30',
      '2026-11-22',
      '2026-11-08',
      '2026-11-01',
    ]);
  });

  it("treats today's ride as the next one", () => {
    expect(order(['2026-11-20', '2026-11-26'], '2026-11-26')).toEqual(['2026-11-26', '2026-11-20']);
  });

  it('does not mutate the input', () => {
    const input = ['2026-11-01', '2026-11-29'].map(ev);
    sortAgendaEvents(input, '2026-11-26');
    expect(input.map((e) => e.isoDate)).toEqual(['2026-11-01', '2026-11-29']);
  });
});
