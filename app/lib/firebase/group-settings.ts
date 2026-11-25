import { unstable_cache } from 'next/cache';
import {
  DEFAULT_GROUP_SETTINGS,
  GROUP_SETTINGS_CACHE_TAG,
  GROUP_SETTINGS_PATH,
  type GroupSettings,
} from '@/app/constants/groups';
import { normalizeGroupSettings, groupKey } from '../groupLabels';
import { isMockMode } from './client';

/**
 * Reads the group naming settings with the Admin SDK (server only).
 * Falls back to defaults in mock mode or when the read fails, so pages always render.
 */
export async function getGroupSettings(): Promise<GroupSettings> {
  if (isMockMode) return DEFAULT_GROUP_SETTINGS;
  try {
    const { getAdminDatabase } = await import('./admin');
    const snapshot = await getAdminDatabase().ref(GROUP_SETTINGS_PATH).once('value');
    return normalizeGroupSettings(snapshot.exists() ? snapshot.val() : null);
  } catch (error) {
    console.error('Error fetching group settings from Firebase:', error);
    return DEFAULT_GROUP_SETTINGS;
  }
}

/**
 * Cached read used by the root layout. Invalidated by tag when an admin saves.
 */
export const getCachedGroupSettings = unstable_cache(getGroupSettings, [GROUP_SETTINGS_PATH], {
  tags: [GROUP_SETTINGS_CACHE_TAG],
  revalidate: 3600,
});

/**
 * Persists validated group settings (Admin SDK).
 */
export async function updateGroupSettings(settings: GroupSettings): Promise<GroupSettings> {
  const normalized = normalizeGroupSettings({
    groups: settings.groups,
    updatedAt: new Date().toISOString(),
  });
  if (isMockMode) return normalized;

  const { getAdminDatabase } = await import('./admin');
  await getAdminDatabase().ref(GROUP_SETTINGS_PATH).set(normalized);
  return normalized;
}

/**
 * Counts how many leaderboard entries and members use each stored group code, so the
 * admin screen can list every code actually present in the data (including ones that
 * are not configured yet). Keys are normalized codes (see `groupKey`).
 */
export async function getGroupUsage(): Promise<Record<string, { code: string; count: number }>> {
  const usage: Record<string, { code: string; count: number }> = {};
  const add = (raw: unknown): void => {
    if (typeof raw !== 'string' || !raw.trim()) return;
    const key = groupKey(raw);
    if (key === 'ALL') return; // sync placeholder, not a real group
    usage[key] = { code: usage[key]?.code ?? raw.trim(), count: (usage[key]?.count ?? 0) + 1 };
  };

  if (isMockMode) return usage;
  try {
    const { getAdminDatabase } = await import('./admin');
    const db = getAdminDatabase();
    const [leaderboard, members] = await Promise.all([
      db.ref('leaderboard').once('value'),
      db.ref('members').once('value'),
    ]);
    Object.values((leaderboard.val() ?? {}) as Record<string, { group?: unknown }>).forEach((e) =>
      add(e?.group)
    );
    Object.values((members.val() ?? {}) as Record<string, { preferredGroup?: unknown }>).forEach(
      (m) => add(m?.preferredGroup)
    );
  } catch (error) {
    console.error('Error computing group usage:', error);
  }
  return usage;
}
