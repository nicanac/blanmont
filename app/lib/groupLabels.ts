import {
  DEFAULT_GROUP_SETTINGS,
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
  const groups: GroupDefinition[] = [];
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
    groups.push({ code: cleanCode, label: cleanLabel });
    if (groups.length >= GROUP_MAX_COUNT) break;
  }

  if (groups.length === 0) return DEFAULT_GROUP_SETTINGS;
  return {
    groups,
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
  return (
    settings.groups.find((g) => groupKey(g.code) === direct) ??
    settings.groups.find((g) => groupKey(g.code) === stripped)
  );
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
