/**
 * Visual feedback tool — shared settings contract (safe for client and server).
 * Stored in RTDB node `visual-feedback-settings`; toggled by an admin in /admin/settings.
 */
export type FeedbackAudience = 'admins' | 'members' | 'everyone';

export interface VisualFeedbackSettings {
  enabled: boolean;
  audience: FeedbackAudience;
  updatedAt: string;
  updatedBy?: string;
}

export const FEEDBACK_AUDIENCES: readonly FeedbackAudience[] = ['admins', 'members', 'everyone'];

export const DEFAULT_FEEDBACK_SETTINGS: VisualFeedbackSettings = {
  enabled: false,
  audience: 'admins',
  updatedAt: '',
};

/** Layer 3 kill-switch: NEXT_PUBLIC_FEEDBACK_ENABLED=false turns the tool off without code changes. */
export function isFeedbackKilled(): boolean {
  return process.env.NEXT_PUBLIC_FEEDBACK_ENABLED === 'false';
}

/** Coerces untrusted RTDB data into a valid settings object (fails closed: disabled, admins only). */
export function normalizeFeedbackSettings(input: unknown): VisualFeedbackSettings {
  if (!input || typeof input !== 'object') return { ...DEFAULT_FEEDBACK_SETTINGS };
  const data = input as Record<string, unknown>;
  return {
    enabled: data.enabled === true,
    audience: FEEDBACK_AUDIENCES.includes(data.audience as FeedbackAudience)
      ? (data.audience as FeedbackAudience)
      : 'admins',
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : '',
    updatedBy: typeof data.updatedBy === 'string' ? data.updatedBy : undefined,
  };
}

/** True when a caller (session or anonymous) may use the tool under the given settings. */
export function isAudienceAllowed(
  settings: Pick<VisualFeedbackSettings, 'enabled' | 'audience'>,
  session: { isAdmin: boolean } | null
): boolean {
  if (!settings.enabled || isFeedbackKilled()) return false;
  if (settings.audience === 'everyone') return true;
  if (settings.audience === 'members') return session !== null;
  return session?.isAdmin === true;
}
