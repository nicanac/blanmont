/**
 * Group naming settings: the codes stored on attendance records, leaderboard entries,
 * members and trial requests (A, A-, B, C, VTT…) never change; administrators only
 * choose how each code is displayed (e.g. A → "GR1").
 */

/** One group as configured by an administrator. */
export interface GroupDefinition {
  /** Code stored in the database (A, A-, B, C, VTT…). Matched case-insensitively. */
  code: string;
  /** Display name shown everywhere in the app instead of the code. */
  label: string;
  /**
   * Other stored codes merged into this group (e.g. A- shown and counted as GR1 with A).
   * Stored data is never rewritten: a merge is undone by removing the alias.
   */
  aliases?: string[];
}

/** Group naming settings stored at `/group-settings` in Firebase RTDB. */
export interface GroupSettings {
  /** Groups in display order (filters, legends, statistics). */
  groups: GroupDefinition[];
  /** ISO timestamp of the last update. */
  updatedAt?: string;
}

/** Firebase RTDB path of the group naming settings. */
export const GROUP_SETTINGS_PATH = 'group-settings';

/** Cache tag used to revalidate every page that renders group names. */
export const GROUP_SETTINGS_CACHE_TAG = 'group-settings';

export const GROUP_CODE_MAX_LENGTH = 12;
export const GROUP_LABEL_MAX_LENGTH = 24;
export const GROUP_MAX_COUNT = 12;
/** Merged codes per group. */
export const GROUP_ALIAS_MAX_COUNT = 12;

/**
 * Defaults keep today's display unchanged: every label equals its code.
 */
export const DEFAULT_GROUP_SETTINGS: GroupSettings = {
  groups: [
    { code: 'A', label: 'A' },
    { code: 'A-', label: 'A-' },
    { code: 'B', label: 'B' },
    { code: 'C', label: 'C' },
    { code: 'VTT', label: 'VTT' },
  ],
};
