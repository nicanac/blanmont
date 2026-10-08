import { describe, it, expect } from 'vitest';
import { safeValidate } from '@/app/lib/validation';
import {
  ActivityClientLogSchema,
  ActivityLogFilterSchema,
} from '@/app/lib/validation/logging';

describe('Activity Logging Validation', () => {
  it('validates a correct client activity payload', () => {
    const validPayload = {
      category: 'navigation',
      action: 'traces:gpx_download',
      title: 'Téléchargement GPX : Boucle Méhaigne',
      severity: 'info',
      path: '/traces/trace_123',
      metadata: { traceId: 'trace_123', distance: 95 },
      visitorId: 'anon_1728374920_k3x9d',
    };

    const result = safeValidate(ActivityClientLogSchema, validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.action).toBe('traces:gpx_download');
      expect(result.data.category).toBe('navigation');
    }
  });

  it('rejects payload with invalid category', () => {
    const invalidPayload = {
      category: 'unknown_cat',
      action: 'test',
      title: 'Test',
    };

    const result = safeValidate(ActivityClientLogSchema, invalidPayload);
    expect(result.success).toBe(false);
  });

  it('rejects payload with empty title or action', () => {
    const invalidPayload = {
      category: 'auth',
      action: '',
      title: '',
    };

    const result = safeValidate(ActivityClientLogSchema, invalidPayload);
    expect(result.success).toBe(false);
  });

  it('validates ActivityLogFilterSchema with proper yearMonth format', () => {
    const validFilter = {
      yearMonth: '2026-10',
      category: 'admin',
      severity: 'warn',
      userType: 'member',
      searchQuery: 'pointage',
      limit: 50,
    };

    const result = safeValidate(ActivityLogFilterSchema, validFilter);
    expect(result.success).toBe(true);
  });

  it('rejects malformed yearMonth string', () => {
    const invalidFilter = {
      yearMonth: '2026/10',
    };

    const result = safeValidate(ActivityLogFilterSchema, invalidFilter);
    expect(result.success).toBe(false);
  });
});
