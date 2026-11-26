import { z } from 'zod';

export const FEEDBACK_CATEGORIES = ['ui', 'bug', 'feature', 'copy'] as const;
export const FEEDBACK_PRIORITIES = ['critical', 'important', 'suggestion'] as const;

/** Hard cap on the screenshot data URL (JPEG, ~150-450 KB in practice). */
export const MAX_SCREENSHOT_CHARS = 5_500_000;

export const feedbackSchema = z.object({
  title: z.string().trim().min(3, 'Titre trop court').max(120),
  comment: z.string().trim().min(3, 'Décrivez le problème').max(4000),
  expectedBehavior: z.string().trim().max(2000).optional(),
  category: z.enum(FEEDBACK_CATEGORIES),
  priority: z.enum(FEEDBACK_PRIORITIES),
  screenshot: z.string().max(MAX_SCREENSHOT_CHARS).optional(),
  context: z.object({
    url: z.string().max(500),
    routePath: z.string().max(300),
    viewport: z.object({
      width: z.number().int().min(0).max(20000),
      height: z.number().int().min(0).max(20000),
      devicePixelRatio: z.number().min(0).max(10),
    }),
    userAgent: z.string().max(400),
    captureMode: z.enum(['native_tab', 'dom_snapshot', 'none']),
    consoleErrors: z.array(z.string().max(300)).max(10),
  }),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
