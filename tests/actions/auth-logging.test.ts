import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginAction, loginWithStatusAction, logoutAction } from '@/app/actions/auth';
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

    vi.spyOn(firebaseMembers, 'authenticateMember').mockResolvedValue({ ok: true, member: mockMember as any });
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

  it('refuses the login and logs an error when the session cannot be signed', async () => {
    const mockMember = { id: 'member-9', name: 'Membre', email: 'm@blanmont.be', role: ['Member'] };
    vi.spyOn(firebaseMembers, 'authenticateMember').mockResolvedValue({ ok: true, member: mockMember as any });
    vi.spyOn(sessionModule, 'setSessionCookie').mockRejectedValue(
      Object.assign(new Error('SESSION_SECRET is not configured'), { name: 'SessionSecretMissingError' })
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const recordSpy = vi.spyOn(activityLoggerModule, 'recordActivity').mockResolvedValue('log_3');

    const result = await loginAction('m@blanmont.be', 'password123');
    expect(result).toBeNull();
    expect(recordSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'auth:login_failure',
        severity: 'error',
        metadata: { reason: 'SessionSecretMissingError' },
      })
    );
    expect(recordSpy).not.toHaveBeenCalledWith(expect.objectContaining({ action: 'auth:login_success' }));
  });

  it('records auth:login_failure when member credentials are invalid', async () => {
    vi.spyOn(firebaseMembers, 'authenticateMember').mockResolvedValue({
      ok: false,
      reason: 'invalid_credentials',
      code: 'auth/invalid-credential',
    });
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

  it('tells the page why the login failed (too many attempts, account not linked)', async () => {
    const recordSpy = vi.spyOn(activityLoggerModule, 'recordActivity').mockResolvedValue('log_4');
    vi.spyOn(firebaseMembers, 'authenticateMember')
      .mockResolvedValueOnce({ ok: false, reason: 'too_many_attempts', code: 'auth/too-many-requests' })
      .mockResolvedValueOnce({ ok: false, reason: 'not_linked' });

    expect(await loginWithStatusAction('m@blanmont.be', 'pw')).toEqual({ ok: false, reason: 'too_many_attempts' });
    expect(await loginWithStatusAction('m@blanmont.be', 'pw')).toEqual({ ok: false, reason: 'not_linked' });
    expect(recordSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'auth:login_failure',
        metadata: { reason: 'too_many_attempts', firebaseCode: 'auth/too-many-requests' },
      })
    );
    // A member who proved the password but has no record is a directory problem: error level
    expect(recordSpy).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'auth:login_failure', severity: 'error', metadata: { reason: 'not_linked' } })
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
