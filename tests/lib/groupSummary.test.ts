import { describe, expect, it } from 'vitest';
import { DEFAULT_GROUP_SETTINGS, type GroupSettings } from '@/app/constants/groups';
import { groupSummaryEntries, groupSummaryText } from '@/app/lib/groupSummary';

const renamed: GroupSettings = {
  groups: [
    { code: 'A', label: 'GR1', aliases: ['A-'] },
    { code: 'B', label: 'GR2' },
    { code: 'BC', label: 'GR3' },
    { code: 'C', label: 'GR4', aliases: ['Club'] },
    { code: 'VTT', label: 'VTT' },
  ],
};

describe('groupSummaryText', () => {
  it('lists configured names with the paces of PACE_GROUPS', () => {
    expect(groupSummaryText(renamed, { withPaces: true })).toBe(
      'GR1 (> 30 km/h), GR2 (25 – 28 km/h), GR3 (24 – 27 km/h), GR4 (< 25 km/h) ou VTT'
    );
  });

  it('lists only the names with "&" by default', () => {
    expect(groupSummaryText(renamed)).toBe('GR1, GR2, GR3, GR4 & VTT');
  });

  it('falls back to the stored codes while nothing is renamed', () => {
    expect(groupSummaryText(DEFAULT_GROUP_SETTINGS)).toBe('A, B, BC, C & VTT');
  });

  it('shows a group once when two codes share one configured group', () => {
    const merged: GroupSettings = {
      groups: [{ code: 'B', label: 'GR2', aliases: ['BC'] }, { code: 'A', label: 'GR1' }],
    };
    const labels = groupSummaryEntries(merged).map((e) => e.label);
    expect(labels.filter((l) => l === 'GR2')).toHaveLength(1);
  });
});
