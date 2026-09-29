import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getFirebaseAuth, sendPasswordResetEmail } from '@/app/lib/firebase/client';
import { requestPasswordReset } from '@/app/lib/auth/password-reset';

vi.mock('@/app/lib/firebase/client', () => ({
  getFirebaseAuth: vi.fn(() => 'firebase-auth'),
  sendPasswordResetEmail: vi.fn(),
}));

describe('requestPasswordReset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends a reset email to the provided address', async () => {
    await requestPasswordReset('member@blanmont.be');

    expect(getFirebaseAuth).toHaveBeenCalledOnce();
    expect(sendPasswordResetEmail).toHaveBeenCalledWith('firebase-auth', 'member@blanmont.be');
  });

  it('does not disclose whether the email has an account', async () => {
    vi.mocked(sendPasswordResetEmail).mockRejectedValue({
      code: 'auth/user-not-found',
    });

    await expect(requestPasswordReset('unknown@blanmont.be')).resolves.toBeUndefined();
  });

  it('propagates other Firebase errors', async () => {
    const error = new Error('Firebase unavailable');
    vi.mocked(sendPasswordResetEmail).mockRejectedValue(error);

    await expect(requestPasswordReset('member@blanmont.be')).rejects.toBe(error);
  });
});
