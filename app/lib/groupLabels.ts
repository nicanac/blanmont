import {
  DEFAULT_GROUP_SETTINGS,
  GROUP_ALIAS_MAX_COUNT,
  GROUP_CODE_MAX_LENGTH,
  GROUP_LABEL_MAX_LENGTH,
  GROUP_MAX_COUNT,
  type GroupDefinition,
  type GroupSettings,
} from '@/app/constants/groups';

/** Normalized lookup key for a group code ("  a- " → "A-"). */
export function groupKey(code: string): string {
  return code.trim().toUpperCase();
}

/** Strips a leading "Groupe " / "Gr. " so "Groupe A" resolves like "A". */
function stripGroupPrefix(raw: string): string {
  return raw.trim().replace(/^(groupe|gr\.?)\s+/i, '');
}

/**
 * Normalizes raw data read from Firebase into valid GroupSettings.
 * Drops malformed rows and duplicate codes; falls back to defaults when nothing is usable.
 */
export function normalizeGroupSettings(input: unknown): GroupSettings {
  if (!input || typeof input !== 'object') return DEFAULT_GROUP_SETTINGS;
  const data = input as { groups?: unknown; updatedAt?: unknown };
  // RTDB may return arrays as index-keyed objects.
  const rawGroups: unknown[] = Array.isArray(data.groups)
    ? data.groups
    : data.groups && typeof data.groups === 'object'
      ? Object.values(data.groups)
      : [];

  const seen = new Set<string>();
  const groups: Array<GroupDefinition & { rawAliases?: unknown }> = [];
  for (const row of rawGroups) {
    if (!row || typeof row !== 'object') continue;
    const { code, label } = row as { code?: unknown; label?: unknown };
    if (typeof code !== 'string') continue;
    const cleanCode = code.trim().slice(0, GROUP_CODE_MAX_LENGTH);
    if (!cleanCode || seen.has(groupKey(cleanCode))) continue;
    const cleanLabel =
      typeof label === 'string' && label.trim()
        ? label.trim().slice(0, GROUP_LABEL_MAX_LENGTH)
        : cleanCode;
    seen.add(groupKey(cleanCode));
    groups.push({ code: cleanCode, label: cleanLabel, rawAliases: (row as { aliases?: unknown }).aliases });
    if (groups.length >= GROUP_MAX_COUNT) break;
  }

  // Aliases second, so a primary code always wins over the same value merged elsewhere.
  const result: GroupDefinition[] = groups.map(({ code, label, rawAliases }) => {
    const list: unknown[] = Array.isArray(rawAliases)
      ? rawAliases
      : rawAliases && typeof rawAliases === 'object'
        ? Object.values(rawAliases)
        : [];
    const aliases: string[] = [];
    for (const alias of list) {
      if (typeof alias !== 'string') continue;
      const clean = alias.trim().slice(0, GROUP_CODE_MAX_LENGTH);
      if (!clean || seen.has(groupKey(clean))) continue;
      seen.add(groupKey(clean));
      aliases.push(clean);
      if (aliases.length >= GROUP_ALIAS_MAX_COUNT) break;
    }
    return aliases.length > 0 ? { code, label, aliases } : { code, label };
  });

  if (result.length === 0) return DEFAULT_GROUP_SETTINGS;
  return {
    groups: result,
    ...(typeof data.updatedAt === 'string' ? { updatedAt: data.updatedAt } : {}),
  };
}

/** Finds the configured group for a stored value ("A", "a-", "Groupe B"…). */
export function findGroup(
  raw: string | null | undefined,
  settings: GroupSettings
): GroupDefinition | undefined {
  if (!raw) return undefined;
  const direct = groupKey(raw);
  const stripped = groupKey(stripGroupPrefix(raw));
  const matches = (g: GroupDefinition, key: string): boolean =>
    groupKey(g.code) === key || (g.aliases ?? []).some((a) => groupKey(a) === key);
  return (
    settings.groups.find((g) => matches(g, direct)) ??
    settings.groups.find((g) => matches(g, stripped))
  );
}

/** Every stored code a group stands for: its own code first, then the merged ones. */
export function groupCodes(group: GroupDefinition): string[] {
  return [group.code, ...(group.aliases ?? [])];
}

/**
 * Key to group records by: the configured group's own code, so merged codes (A, A-)
 * land in the same bucket. Unknown values are returned trimmed, as stored.
 */
export function canonicalGroup(raw: string | null | undefined, settings: GroupSettings): string {
  if (!raw) return '';
  return findGroup(raw, settings)?.code ?? raw.trim();
}

/** Per-group statistics row, as produced by the club statistics. */
export interface GroupStatRow {
  group: string;
  count: number;
  totalAttendances: number;
  avgRides: number;
  percentOfTotal: number;
}

/**
 * Merges statistics rows whose codes belong to the same configured group
 * (A + A- → one GR1 row), then recomputes averages and shares, biggest first.
 */
export function mergeGroupStats(rows: GroupStatRow[], settings: GroupSettings): GroupStatRow[] {
  const merged = new Map<string, { count: number; totalAttendances: number }>();
  for (const row of rows) {
    const key = canonicalGroup(row.group, settings) || row.group;
    const current = merged.get(key) ?? { count: 0, totalAttendances: 0 };
    merged.set(key, {
      count: current.count + row.count,
      totalAttendances: current.totalAttendances + row.totalAttendances,
    });
  }
  const total = Array.from(merged.values()).reduce((sum, g) => sum + g.totalAttendances, 0);
  return Array.from(merged.entries())
    .map(([group, g]) => ({
      group,
      count: g.count,
      totalAttendances: g.totalAttendances,
      avgRides: g.count > 0 ? Math.round(g.totalAttendances / g.count) : 0,
      percentOfTotal: total > 0 ? Math.round((g.totalAttendances / total) * 100) : 0,
    }))
    .sort((a, b) => b.totalAttendances - a.totalAttendances);
}

/**
 * Short display name of a group: the configured label, or the raw value when the
 * code is not configured (unknown codes are shown as stored, never hidden).
 */
export function groupLabel(raw: string | null | undefined, settings: GroupSettings): string {
  if (!raw) return '';
  return findGroup(raw, settings)?.label ?? raw.trim();
}

/**
 * Long display name for sentences ("Groupe A" by default, "GR1" once renamed).
 * A label that is still the bare code keeps the historical "Groupe " prefix.
 */
export function groupFullName(raw: string | null | undefined, settings: GroupSettings): string {
  if (!raw) return '';
  const group = findGroup(raw, settings);
  if (!group) return /^groupe\s/i.test(raw.trim()) ? raw.trim() : `Groupe ${raw.trim()}`;
  return groupKey(group.label) === groupKey(group.code) ? `Groupe ${group.label}` : group.label;
}

/** Sort comparator following the configured order; unknown codes go last, alphabetically. */
export function compareGroups(a: string, b: string, settings: GroupSettings): number {
  const index = (raw: string): number => {
    const g = findGroup(raw, settings);
    return g ? settings.groups.indexOf(g) : Number.MAX_SAFE_INTEGER;
  };
  return index(a) - index(b) || a.localeCompare(b, 'fr');
}
