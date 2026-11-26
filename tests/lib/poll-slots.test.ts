import { describe, it, expect } from 'vitest';
import {
  responseSlots,
  tallySlots,
  slotsLabel,
  responseGroupKey,
  pollGroupName,
} from '@/app/lib/poll-slots';

describe('poll slots', () => {
  it('maps legacy dayChoice answers to slots', () => {
    expect(responseSlots({ dayChoice: 'samedi' })).toEqual(['samedi-matin']);
    expect(responseSlots({ dayChoice: 'les-deux' })).toEqual(['samedi-matin', 'dimanche-matin']);
    expect(responseSlots({ dayChoice: 'absent' })).toEqual([]);
    // RTDB drops empty arrays: a new absent answer has neither field.
    expect(responseSlots({})).toEqual([]);
    expect(responseSlots({ slots: ['samedi-apres-midi'], dayChoice: 'samedi' })).toEqual(['samedi-apres-midi']);
  });

  it('tallies slots, days, both and absents', () => {
    const t = tallySlots([
      { slots: ['samedi-matin', 'samedi-apres-midi'] },
      { slots: ['samedi-apres-midi', 'dimanche-matin'] },
      { dayChoice: 'dimanche' },
      {},
    ]);
    expect(t.bySlot).toEqual({ 'samedi-matin': 1, 'samedi-apres-midi': 2, 'dimanche-matin': 2 });
    expect([t.saturday, t.sunday, t.both, t.absent, t.riders]).toEqual([2, 2, 1, 1, 3]);
  });

  it('labels slots in display order', () => {
    expect(slotsLabel(['dimanche-matin', 'samedi-matin'])).toBe('Samedi matin + Dimanche matin');
    expect(slotsLabel([])).toBe('Absent');
  });

  it('names GR2 with its objective and keeps legacy answers', () => {
    const name = (code: string): string => ({ 'Groupe B': 'GR2', 'Groupe A': 'GR1' })[code] ?? code;
    expect(pollGroupName({ groupChoice: 'Groupe B', groupVariant: 'moins' }, name)).toBe('GR2−');
    expect(pollGroupName({ groupChoice: 'Groupe B' }, name)).toBe('GR2');
    expect(pollGroupName({ groupChoice: 'Autre' }, name)).toBe('Autre');
    expect(responseGroupKey({ groupChoice: 'Groupe B', groupVariant: 'plus' })).toBe('B+');
    expect(responseGroupKey({ groupChoice: 'Groupe B' })).toBeNull();
    expect(responseGroupKey({ groupChoice: 'Groupe A' })).toBe('A');
  });
});
