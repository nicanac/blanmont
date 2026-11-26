import { PACE_GROUPS, type PaceGroupCode } from '@/app/constants/cycling';
import type { GroupSettings } from '@/app/constants/groups';
import { canonicalGroup, groupLabel } from './groupLabels';

/** One pace group as the site presents it, named by the admin-configured label. */
export interface GroupSummaryEntry {
  code: PaceGroupCode;
  label: string;
  /** Pace from PACE_GROUPS ("> 30 km/h"), or null when it is not a km/h range (VTT). */
  pace: string | null;
}

/**
 * The pace groups in display order with their configured names. Codes merged into the
 * same configured group (e.g. two groups both shown as "GR2") appear once.
 */
export function groupSummaryEntries(settings: GroupSettings): GroupSummaryEntry[] {
  const seen = new Set<string>();
  const entries: GroupSummaryEntry[] = [];
  for (const group of PACE_GROUPS) {
    const key = canonicalGroup(group.id, settings);
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push({
      code: group.id,
      label: groupLabel(group.id, settings),
      pace: group.speed.includes('km/h') ? group.speed : null,
    });
  }
  return entries;
}

/**
 * "GR1, GR2, GR3, GR4 & VTT" (names) or "GR1 (> 30 km/h), … ou VTT" (with paces).
 * The conjunction defaults to "&" for names and "ou" with paces.
 */
export function groupSummaryText(
  settings: GroupSettings,
  options: { withPaces?: boolean; conjunction?: string } = {}
): string {
  const { withPaces = false, conjunction = withPaces ? 'ou' : '&' } = options;
  const parts = groupSummaryEntries(settings).map((e) =>
    withPaces && e.pace ? `${e.label} (${e.pace})` : e.label
  );
  if (parts.length < 2) return parts.join('');
  return `${parts.slice(0, -1).join(', ')} ${conjunction} ${parts[parts.length - 1]}`;
}
