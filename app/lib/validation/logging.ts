import { z } from 'zod';

export const ActivityClientLogSchema = z.object({
  category: z.enum(['auth', 'navigation', 'participation', 'admin', 'security']),
  action: z.string().min(1, 'Action slug is required').max(100),
  title: z.string().min(1, 'Title is required').max(200),
  severity: z.enum(['info', 'warn', 'error', 'security']).default('info'),
  path: z.string().max(500).optional(),
  referrer: z.string().max(1000).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  visitorId: z.string().max(128).optional(),
});

export type ActivityClientLogInput = z.input<typeof ActivityClientLogSchema>;
export type ActivityClientLogOutput = z.output<typeof ActivityClientLogSchema>;

export const ActivityLogFilterSchema = z.object({
  yearMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Format must be YYYY-MM').optional(),
  category: z.enum(['auth', 'navigation', 'participation', 'admin', 'security', 'all']).optional(),
  severity: z.enum(['info', 'warn', 'error', 'security', 'all']).optional(),
  userType: z.enum(['all', 'anonymous', 'member', 'admin']).optional(),
  reviewStatus: z.enum(['unreviewed', 'reviewed', 'flagged', 'all']).optional(),
  searchQuery: z.string().max(100).optional(),
  limit: z.number().int().min(1).max(500).optional(),
});

export type ActivityLogFilterInput = z.infer<typeof ActivityLogFilterSchema>;

export const ActivityReviewUpdateSchema = z.object({
  logId: z.string().min(1, 'ID de log requis'),
  yearMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Format YYYY-MM requis').optional(),
  status: z.enum(['unreviewed', 'reviewed', 'flagged']),
  notes: z.string().max(1000).optional().nullable(),
});

export type ActivityReviewUpdateInput = z.infer<typeof ActivityReviewUpdateSchema>;

export const ActivityBatchReviewSchema = z.object({
  logIds: z.array(z.string().min(1)).min(1, 'Au moins un log requis').max(200),
  yearMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Format YYYY-MM requis').optional(),
  status: z.enum(['unreviewed', 'reviewed', 'flagged']),
  notes: z.string().max(1000).optional().nullable(),
});

export type ActivityBatchReviewInput = z.infer<typeof ActivityBatchReviewSchema>;

