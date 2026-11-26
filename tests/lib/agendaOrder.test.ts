import { describe, it, expect } from 'vitest';
import { orderAgendaEvents } from '@/app/lib/agendaOrder';
import type { CalendarEvent } from '@/app/types';

const ev = (id: string, isoDate: string): CalendarEvent => ({
  id,
  isoDate,
  location: id,
  distances: '',
  departure: '09h00',
  address: '',
  remarks: '',
  alternative: '',
  group: '',
});

const TODAY = '2026-11-10';
const isDone = (e: CalendarEvent) => e.isoDate < TODAY;
const ids = (list: CalendarEvent[]) => list.map((e) => e.id);

describe('orderAgendaEvents', () => {
  it('puts upcoming ascending first, then past descending', () => {
    const out = orderAgendaEvents(
      [ev('p1', '2026-11-01'), ev('u2', '2026-11-28'), ev('p2', '2026-10-04'), ev('u1', '2026-11-15')],
      isDone,
    );
    expect(ids(out)).toEqual(['u1', 'u2', 'p1', 'p2']);
  });

  it('keeps a ride happening today in the upcoming block', () => {
    const out = orderAgendaEvents([ev('p', '2026-11-01'), ev('t', TODAY), ev('u', '2026-11-12')], isDone);
    expect(ids(out)).toEqual(['t', 'u', 'p']);
  });

  it('orders all-past lists most recent first', () => {
    expect(ids(orderAgendaEvents([ev('a', '2026-01-01'), ev('b', '2026-03-01')], isDone))).toEqual(['b', 'a']);
  });

  it('orders all-upcoming lists soonest first', () => {
    expect(ids(orderAgendaEvents([ev('b', '2026-12-01'), ev('a', '2026-11-20')], isDone))).toEqual(['a', 'b']);
  });

  it('keeps same-day rides in incoming order and does not mutate the input', () => {
    const input = [ev('x', '2026-11-20'), ev('y', '2026-11-20'), ev('m', '2026-11-01'), ev('n', '2026-11-01')];
    const out = orderAgendaEvents(input, isDone);
    expect(ids(out)).toEqual(['x', 'y', 'm', 'n']);
    expect(ids(input)).toEqual(['x', 'y', 'm', 'n']);
  });
});
