import { describe, it, expect, vi } from 'vitest';
import * as adminModule from '@/app/lib/firebase/admin';

vi.mock('@/app/lib/firebase/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/app/lib/firebase/client')>()),
  isMockMode: false,
}));

import { recordActivity } from '@/app/lib/logging/activityLogger';

/** Like the Admin SDK: RTDB refuses any undefined value in the written tree. */
function containsUndefined(value: unknown): boolean {
  if (value === undefined) return true;
  if (value && typeof value === 'object') return Object.values(value).some(containsUndefined);
  return false;
}

describe('recordActivity on the Realtime Database', () => {
  it('writes server-side events without undefined values (they used to be rejected and lost)', async () => {
    const set = vi.fn(async (value: unknown) => {
      if (containsUndefined(value)) throw new Error('set failed: value argument contains undefined');
    });
    vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: () => ({ set }) } as never);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await recordActivity({
      category: 'auth',
      action: 'auth:activation_email_failed',
      title: 'Email non envoyé',
      severity: 'error',
      user: { isAuthenticated: false, userEmail: 'm@blanmont.be' },
      metadata: { reason: 'failed' },
    });

    expect(set).toHaveBeenCalledTimes(1);
    expect(consoleError).not.toHaveBeenCalled();
    expect(set.mock.calls[0][0]).toMatchObject({ action: 'auth:activation_email_failed', user: { userEmail: 'm@blanmont.be' } });
  });
});
