import { describe, it, expect } from 'vitest';
import { isSummerTime, weekendSchedule } from '@/app/lib/weekendSchedule';

describe('isSummerTime (Europe/Brussels DST)', () => {
  it('switches on the last Sunday of March at 01:00 UTC', () => {
    expect(isSummerTime(new Date('2026-03-29T00:59:59Z'))).toBe(false);
    expect(isSummerTime(new Date('2026-03-29T01:00:00Z'))).toBe(true);
  });
  it('switches back on the last Sunday of October at 01:00 UTC', () => {
    expect(isSummerTime(new Date('2026-10-25T00:59:59Z'))).toBe(true);
    expect(isSummerTime(new Date('2026-10-25T01:00:00Z'))).toBe(false);
  });
  it('is winter in January and December', () => {
    expect(isSummerTime(new Date('2026-01-15T12:00:00Z'))).toBe(false);
    expect(isSummerTime(new Date('2026-12-15T12:00:00Z'))).toBe(false);
  });
});

describe('weekendSchedule', () => {
  const summer = new Date('2026-07-01T10:00:00Z');
  const winter = new Date('2026-11-26T10:00:00Z');

  it('summer defaults to 8h30 with a 13h00 alternative', () => {
    const s = weekendSchedule(summer);
    expect(s.saturday.value).toBe('8h30');
    expect(s.saturday.detail).toContain('13h00');
    expect(s.sunday.value).toBe('9h00');
  });
  it('summer takes the Saturday calendar event time', () => {
    expect(weekendSchedule(summer, '8h00').saturday.value).toBe('8h00');
  });
  it('winter is Saturday 13h00 only, ignoring the calendar morning time', () => {
    const s = weekendSchedule(winter, '8h00');
    expect(s.saturday.value).toBe('13h00');
    expect(s.saturday.detail).not.toContain(', ou');
    expect(s.sunday.value).toBe('9h00');
  });
});
