import { describe, it, expect } from 'vitest';
import {
  compareGroups,
  findGroup,
  groupFullName,
  groupKey,
  groupLabel,
  normalizeGroupSettings,
} from '@/app/lib/groupLabels';
import {
  DEFAULT_GROUP_SETTINGS,
  GROUP_MAX_COUNT,
  type GroupSettings,
} from '@/app/constants/groups';
import { GroupSettingsSchema, safeValidate } from '@/app/lib/validation';

// The configuration from the feature request: A → GR1, B → gr2, C → gr3 (A- left as is).
const renamed: GroupSettings = {
  groups: [
    { code: 'A', label: 'GR1' },
    { code: 'A-', label: 'A-' },
    { code: 'B', label: 'gr2' },
    { code: 'C', label: 'gr3' },
  ],
};

describe('groupKey', () => {
  it('trims and upper-cases codes', () => {
    expect(groupKey('  a- ')).toBe('A-');
  });
});

describe('normalizeGroupSettings', () => {
  it('falls back to defaults for empty or invalid input', () => {
    expect(normalizeGroupSettings(null)).toBe(DEFAULT_GROUP_SETTINGS);
    expect(normalizeGroupSettings('x')).toBe(DEFAULT_GROUP_SETTINGS);
    expect(normalizeGroupSettings({ groups: [] })).toBe(DEFAULT_GROUP_SETTINGS);
  });

  it('accepts RTDB index-keyed objects and keeps order', () => {
    const result = normalizeGroupSettings({
      groups: { 0: { code: 'B', label: 'gr2' }, 1: { code: 'A', label: 'GR1' } },
      updatedAt: '2026-11-25T10:00:00.000Z',
    });
    expect(result.groups.map((g) => g.code)).toEqual(['B', 'A']);
    expect(result.updatedAt).toBe('2026-11-25T10:00:00.000Z');
  });

  it('drops malformed rows and duplicate codes, defaults empty labels to the code', () => {
    const result = normalizeGroupSettings({
      groups: [
        { code: ' A ', label: ' GR1 ' },
        { code: 'a', label: 'dup' },
        { label: 'no code' },
        null,
        { code: 'C', label: '   ' },
      ],
    });
    expect(result.groups).toEqual([
      { code: 'A', label: 'GR1' },
      { code: 'C', label: 'C' },
    ]);
  });

  it('caps the number of groups', () => {
    const many = Array.from({ length: GROUP_MAX_COUNT + 5 }, (_, i) => ({
      code: `G${i}`,
      label: `L${i}`,
    }));
    expect(normalizeGroupSettings({ groups: many }).groups).toHaveLength(GROUP_MAX_COUNT);
  });
});

describe('groupLabel / findGroup', () => {
  it('maps stored codes to their configured label, case-insensitively', () => {
    expect(groupLabel('A', renamed)).toBe('GR1');
    expect(groupLabel('b', renamed)).toBe('gr2');
    expect(groupLabel('C', renamed)).toBe('gr3');
  });

  it('does not confuse A- with A', () => {
    expect(groupLabel('A-', renamed)).toBe('A-');
    expect(findGroup('A-', renamed)?.code).toBe('A-');
  });

  it('resolves "Groupe X" and "Gr. X" forms', () => {
    expect(groupLabel('Groupe A', renamed)).toBe('GR1');
    expect(groupLabel('Gr. B', renamed)).toBe('gr2');
  });

  it('shows unknown codes as stored and empty values as empty', () => {
    expect(groupLabel('VTT', renamed)).toBe('VTT');
    expect(groupLabel('', renamed)).toBe('');
    expect(groupLabel(undefined, renamed)).toBe('');
  });
});

describe('groupFullName', () => {
  it('keeps the "Groupe" prefix while a label is still the bare code', () => {
    expect(groupFullName('A', DEFAULT_GROUP_SETTINGS)).toBe('Groupe A');
    expect(groupFullName('A-', renamed)).toBe('Groupe A-');
    expect(groupFullName('X', renamed)).toBe('Groupe X');
    expect(groupFullName('Groupe X', renamed)).toBe('Groupe X');
  });

  it('uses the custom label alone once renamed', () => {
    expect(groupFullName('A', renamed)).toBe('GR1');
    expect(groupFullName('Groupe C', renamed)).toBe('gr3');
  });
});

describe('compareGroups', () => {
  it('sorts by configured order and puts unknown codes last', () => {
    const sorted = ['VTT', 'C', 'A-', 'B', 'A', 'Sans groupe'].sort((a, b) =>
      compareGroups(a, b, renamed)
    );
    expect(sorted).toEqual(['A', 'A-', 'B', 'C', 'Sans groupe', 'VTT']);
  });
});

describe('GroupSettingsSchema', () => {
  it('accepts a valid configuration and trims values', () => {
    const result = safeValidate(GroupSettingsSchema, {
      groups: [
        { code: ' A ', label: ' GR1 ' },
        { code: 'B', label: 'gr2' },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.groups[0]).toEqual({ code: 'A', label: 'GR1' });
  });

  it('rejects duplicate codes and duplicate labels (case-insensitive)', () => {
    const result = safeValidate(GroupSettingsSchema, {
      groups: [
        { code: 'A', label: 'GR1' },
        { code: 'a', label: 'gr1' },
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.map((e) => e.field)).toEqual(['groups.1.code', 'groups.1.label']);
    }
  });

  it('rejects empty lists, empty labels and over-long labels', () => {
    expect(safeValidate(GroupSettingsSchema, { groups: [] }).success).toBe(false);
    expect(
      safeValidate(GroupSettingsSchema, { groups: [{ code: 'A', label: '  ' }] }).success
    ).toBe(false);
    expect(
      safeValidate(GroupSettingsSchema, { groups: [{ code: 'A', label: 'x'.repeat(25) }] }).success
    ).toBe(false);
  });
});
