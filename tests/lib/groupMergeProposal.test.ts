import { describe, it, expect } from 'vitest';
import {
  isSameGrouping,
  matchMergeRule,
  proposeGroupMerge,
} from '@/app/lib/groupMergeProposal';
import { DEFAULT_GROUP_SETTINGS } from '@/app/constants/groups';

describe('matchMergeRule', () => {
  it.each([
    ['A', 'GR1'],
    ['a-', 'GR1'],
    ['Groupe A', 'GR1'],
    ['B', 'GR2'],
    ['BC', 'GR3'],
    ['b c', 'GR3'],
    ['B/C', 'GR3'],
    ['B allure C', 'GR3'],
    ['C', 'GR4'],
    ['Club', 'GR4'],
    ['CLUB ?', 'GR4'],
    ['V', 'VTT'],
    ['vtt', 'VTT'],
  ])('maps %s to %s', (code, label) => {
    expect(matchMergeRule(code)?.label).toBe(label);
  });

  it('leaves unknown codes alone', () => {
    expect(matchMergeRule('J')).toBeUndefined();
    expect(matchMergeRule('R')).toBeUndefined();
    expect(matchMergeRule('  ')).toBeUndefined();
  });
});

describe('proposeGroupMerge', () => {
  it('merges the club codes into GR1–GR4 + VTT and reports the leftovers', () => {
    const current = [
      { code: 'A', label: 'GR1' },
      { code: 'A-', label: 'GR2' },
      { code: 'B', label: 'GR3' },
      { code: 'C', label: 'GR4' },
      { code: 'VTT', label: 'VTT' },
    ];
    const { groups, unmatched } = proposeGroupMerge(current, [
      'A',
      'A-',
      'B',
      'BC',
      'C',
      'Club',
      'V',
      'J',
    ]);
    expect(groups).toEqual([
      { code: 'A', label: 'GR1', aliases: ['A-'] },
      { code: 'B', label: 'GR2' },
      { code: 'BC', label: 'GR3' },
      { code: 'C', label: 'GR4', aliases: ['Club'] },
      { code: 'VTT', label: 'VTT', aliases: ['V'] },
    ]);
    expect(unmatched).toEqual(['J']);
  });

  it('keeps configured groups no rule covers, without reusing a proposed name', () => {
    const { groups } = proposeGroupMerge(
      [
        { code: 'A', label: 'GR1' },
        { code: 'R', label: 'GR1 bis', aliases: ['Rouge'] },
        { code: 'J', label: 'GR2' },
      ],
      []
    );
    expect(groups.slice(5)).toEqual([
      { code: 'R', label: 'GR1 bis', aliases: ['Rouge'] },
      { code: 'J', label: 'J' },
    ]);
  });

  it('is stable: applying the proposal twice gives the same grouping', () => {
    const first = proposeGroupMerge(DEFAULT_GROUP_SETTINGS.groups, ['BC', 'Club']);
    const second = proposeGroupMerge(first.groups, ['BC', 'Club']);
    expect(isSameGrouping(first.groups, second.groups)).toBe(true);
    expect(isSameGrouping(DEFAULT_GROUP_SETTINGS.groups, first.groups)).toBe(false);
  });
});
