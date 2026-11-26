import {
  DEFAULT_FEEDBACK_SETTINGS,
  normalizeFeedbackSettings,
  type VisualFeedbackSettings,
} from '../feedback/settings';
import { isMockMode } from './client';

const NODE = 'visual-feedback-settings';

/** Reads the feedback tool settings (server only). Fails closed to "disabled" on any error. */
export async function getVisualFeedbackSettings(): Promise<VisualFeedbackSettings> {
  if (isMockMode) return { ...DEFAULT_FEEDBACK_SETTINGS };
  try {
    const { getAdminDatabase } = await import('./admin');
    const snapshot = await getAdminDatabase().ref(NODE).once('value');
    return normalizeFeedbackSettings(snapshot.val());
  } catch (error) {
    console.error('Error reading visual feedback settings:', error);
    return { ...DEFAULT_FEEDBACK_SETTINGS };
  }
}

/** Persists the feedback tool settings (server only, admin routes). */
export async function updateVisualFeedbackSettings(
  patch: Pick<VisualFeedbackSettings, 'enabled' | 'audience'>,
  updatedBy: string
): Promise<VisualFeedbackSettings> {
  const next: VisualFeedbackSettings = normalizeFeedbackSettings({
    ...patch,
    updatedAt: new Date().toISOString(),
    updatedBy,
  });
  if (isMockMode) return next;
  const { getAdminDatabase } = await import('./admin');
  // RTDB rejects undefined values.
  await getAdminDatabase().ref(NODE).set(JSON.parse(JSON.stringify(next)));
  return next;
}
