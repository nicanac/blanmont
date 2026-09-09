import { describe, it, expect } from 'vitest';
import { checkIsAdmin, ADMIN_ROLES, ADMIN_EMAILS } from '@/app/utils/auth';
import { User } from '@/app/types';

describe('auth utils - checkIsAdmin', () => {
  it('returns true when user has an admin role', () => {
    for (const role of ADMIN_ROLES) {
      const user: User = {
        id: 'user-1',
        username: 'test-admin',
        name: 'Test Admin',
        email: 'member@blanmont.be',
        role: [role],
      };
      expect(checkIsAdmin(user)).toBe(true);
    }
  });

  it('is case-insensitive for admin roles', () => {
    const user: User = {
      id: 'user-case',
      username: 'case-admin',
      name: 'Case Admin',
      email: 'member@blanmont.be',
      role: ['ADMIN'],
    };
    expect(checkIsAdmin(user)).toBe(true);
  });

  it('returns true when user has a single role string matching admin', () => {
    const user = {
      id: 'user-string-role',
      username: 'admin',
      name: 'Admin',
      email: 'someone@blanmont.be',
      role: 'President' as unknown as string[],
    } as User;
    expect(checkIsAdmin(user)).toBe(true);
  });

  it('returns true when user email matches an admin email', () => {
    for (const email of ADMIN_EMAILS) {
      const user: User = {
        id: 'user-admin-email',
        username: 'admin-email',
        name: 'Admin Email',
        email,
        role: ['Member'],
      };
      expect(checkIsAdmin(user)).toBe(true);
    }
  });

  it('returns false for regular members with standard roles and emails', () => {
    const user: User = {
      id: 'user-regular',
      username: 'regular-cyclist',
      name: 'Regular Cyclist',
      email: 'cyclist@example.com',
      role: ['Member', 'Cyclo'],
    };
    expect(checkIsAdmin(user)).toBe(false);
  });

  it('returns false when user is null (in Node environment without window/localStorage)', () => {
    expect(checkIsAdmin(null)).toBe(false);
  });
});
