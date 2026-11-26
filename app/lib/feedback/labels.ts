import type { FEEDBACK_CATEGORIES, FEEDBACK_PRIORITIES } from './schema';

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];
export type FeedbackPriority = (typeof FEEDBACK_PRIORITIES)[number];
export type ReportStatus = 'open' | 'resolved' | 'dismissed';

export const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  ui: 'Affichage / design',
  bug: 'Bug',
  feature: 'Idée / fonctionnalité',
  copy: 'Texte / orthographe',
};

export const PRIORITY_LABELS: Record<FeedbackPriority, string> = {
  critical: 'Bloquant',
  important: 'Important',
  suggestion: 'Suggestion',
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  open: 'À traiter',
  resolved: 'Résolu',
  dismissed: 'Écarté',
};
