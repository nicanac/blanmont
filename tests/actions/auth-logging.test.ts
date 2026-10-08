import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginAction, logoutAction } from '@/app/actions/auth';
import * as firebaseMembers from '@/app/lib/firebase/members';
import * as sessionModule from '@/app/lib/auth/session';
import * as activityLoggerModule from '@/app/lib/logging/activityLogger';

describe('Auth Actions Activity Logging', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('records auth:login_success when member credentials are valid', async () => {
    const mockMember = {
      id: 'member-123',
      name: 'Laurent Vanbelle',
      email: 'laurent@blanmont.be',
      role: ['Member'],
    };

    vi.spyOn(firebaseMembers, 'validateUser').mockResolvedValue(mockMember as any);
    vi.spyOn(sessionModule, 'setSessionCookie').mockResolvedValue({} as any);
    const recordSpy = vi.spyOn(activityLoggerModule, 'recordActivity').mockResolvedValue('log_1');

    const result = await loginAction('laurent@blanmont.be', 'password123');
    expect(result).toEqual(mockMember);

    expect(recordSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'auth',
        action: 'auth:login_success',
        title: expect.stringContaining('Laurent Vanbelle'),
        severity: 'info',
        user: expect.objectContaining({
          userId: 'member-123',
          userName: 'Laurent Vanbelle',
          isAuthenticated: true,
        }),
      })
    );
  });

  it('records auth:login_failure when member credentials are invalid', async () => {
    vi.spyOn(firebaseMembers, 'validateUser').mockResolvedValue(null);
    const recordSpy = vi.spyOn(activityLoggerModule, 'recordActivity').mockResolvedValue('log_2');

    const result = await loginAction('wrong@blanmont.be', 'wrongpass');
    expect(result).toBeNull();

    expect(recordSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'auth',
        action: 'auth:login_failure',
        title: expect.stringContaining('wrong@blanmont.be'),
        severity: 'warn',
        user: expect.objectContaining({
          isAuthenticated: false,
          userEmail: 'wrong@blanmont.be',
        }),
      })
    );
  });

  it('records auth:logout when a member logs out', async () => {
    vi.spyOn(sessionModule, 'getSessionUser').mockResolvedValue({
      id: 'member-123',
      name: 'Laurent Vanbelle',
      email: 'laurent@blanmont.be',
      role: ['Member'],
      isAdmin: false,
      iat: 1,
      exp: 2,
    });
    vi.spyOn(sessionModule, 'clearSessionCookie').mockResolvedValue();
    const recordSpy = vi.spyOn(activityLoggerModule, 'recordActivity').mockResolvedValue('log_3');

    await logoutAction();

    expect(recordSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'auth',
        action: 'auth:logout',
        title: expect.stringContaining('Laurent Vanbelle'),
        user: expect.objectContaining({
          userId: 'member-123',
          userName: 'Laurent Vanbelle',
          isAuthenticated: true,
        }),
      })
    );
  });
});
