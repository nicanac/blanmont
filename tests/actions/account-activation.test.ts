import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firebase Admin SDK
const mockMembersData = {
  member_1: {
    name: 'Nicolas Bruyere',
    email: 'bruyere.nicolas@gmail.com',
    role: ['Admin'],
    authUid: 'uid-admin-1',
  },
  member_2: {
    name: 'Laurent Cycliste',
    email: 'laurent@blanmont.be',
    role: ['Member'],
    // No authUid initially
  },
};

const mockUserRecord = {
  uid: 'uid-laurent-2',
  email: 'laurent@blanmont.be',
  displayName: 'Laurent Cycliste',
};

const mockUpdate = vi.fn().mockResolvedValue(undefined);
const mockCreateUser = vi.fn().mockResolvedValue(mockUserRecord);
const mockGetUserByEmail = vi.fn();
const mockGeneratePasswordResetLink = vi.fn().mockImplementation((email: string) => {
  return Promise.resolve(`https://blanmont.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=code_12345&apiKey=key_abc`);
});

vi.mock('@/app/lib/firebase/admin', () => ({
  getAdminAuth: () => ({
    getUserByEmail: mockGetUserByEmail,
    createUser: mockCreateUser,
    generatePasswordResetLink: mockGeneratePasswordResetLink,
  }),
  getAdminDatabase: () => ({
    ref: (path: string) => {
      if (path === 'members') {
        return {
          once: vi.fn().mockResolvedValue({
            exists: () => true,
            forEach: (cb: (child: any) => void) => {
              Object.entries(mockMembersData).forEach(([key, val]) => {
                cb({ key, val: () => val });
              });
            },
          }),
        };
      }
      if (path.startsWith('members/')) {
        return {
          update: mockUpdate,
        };
      }
      return {
        once: vi.fn().mockResolvedValue({ exists: () => false }),
      };
    },
  }),
}));

// Import target action after mocking
import { requestAccountActivationAction } from '@/app/actions';

describe('requestAccountActivationAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid email formats', async () => {
    const res = await requestAccountActivationAction('invalid-email-address');
    expect(res.success).toBe(false);
    expect(res.message).toContain('email');
    expect(mockCreateUser).not.toHaveBeenCalled();
    expect(mockGeneratePasswordResetLink).not.toHaveBeenCalled();
  });

  it('rejects activation when email is NOT registered in club database', async () => {
    const unknownEmail = 'stranger@external.com';
    const res = await requestAccountActivationAction(unknownEmail);

    expect(res.success).toBe(false);
    expect(res.message).toContain("Cette adresse email n'est pas enregistrée dans l'annuaire du club");
    // Crucial: do NOT provision user in Firebase Auth and do NOT create reset link
    expect(mockCreateUser).not.toHaveBeenCalled();
    expect(mockGeneratePasswordResetLink).not.toHaveBeenCalled();
  });

  it('provisions user in Firebase Auth and generates link for registered member without auth account', async () => {
    // User does not exist in Firebase Auth yet
    mockGetUserByEmail.mockRejectedValue({ code: 'auth/user-not-found' });

    const memberEmail = 'laurent@blanmont.be';
    const res = await requestAccountActivationAction(memberEmail);

    expect(res.success).toBe(true);
    expect(res.message).toContain('Compte membre vérifié');
    expect(res.directLink).toBe('/auth/action?mode=resetPassword&oobCode=code_12345');

    // Verified: creates Firebase Auth account with member name
    expect(mockCreateUser).toHaveBeenCalledWith({
      email: 'laurent@blanmont.be',
      displayName: 'Laurent Cycliste',
      emailVerified: true,
    });

    // Verified: links authUid in Realtime Database
    expect(mockUpdate).toHaveBeenCalledWith({
      authUid: 'uid-laurent-2',
    });

    expect(mockGeneratePasswordResetLink).toHaveBeenCalledWith('laurent@blanmont.be');
  });

  it('handles registered member who already exists in Firebase Auth', async () => {
    mockGetUserByEmail.mockResolvedValue({
      uid: 'uid-admin-1',
      email: 'bruyere.nicolas@gmail.com',
      displayName: 'Nicolas Bruyere',
    });

    const adminEmail = 'bruyere.nicolas@gmail.com';
    const res = await requestAccountActivationAction(adminEmail);

    expect(res.success).toBe(true);
    expect(res.directLink).toBe('/auth/action?mode=resetPassword&oobCode=code_12345');
    // Does not create a duplicate user
    expect(mockCreateUser).not.toHaveBeenCalled();
    expect(mockGeneratePasswordResetLink).toHaveBeenCalledWith('bruyere.nicolas@gmail.com');
  });
});
