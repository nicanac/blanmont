import { describe, it, expect } from 'vitest';
import {
  hasClubRole,
  toggleClubRole,
  isStandardClubRole,
  extractCustomRoles,
  normalizeRoles,
  CLUB_ROLES,
  isAdminRole,
  checkIsAdmin,
  ADMIN_ROLES,
  ADMIN_EMAILS,
} from '@/app/constants/roles';

describe('roles constants & utils', () => {
  it('identifies Capitaine de Route correctly with synonyms and variations', () => {
    expect(hasClubRole(['Capitaine de Route'], 'Capitaine de Route')).toBe(true);
    expect(hasClubRole(['capitaine'], 'Capitaine de Route')).toBe(true);
    expect(hasClubRole(['Capitaine'], 'Capitaine de Route')).toBe(true);
    expect(hasClubRole(['Road Captain'], 'Capitaine de Route')).toBe(true);
    expect(hasClubRole(['Member'], 'Capitaine de Route')).toBe(false);
  });

  it('identifies Président with and without accents', () => {
    expect(hasClubRole(['Président'], 'Président')).toBe(true);
    expect(hasClubRole(['President'], 'Président')).toBe(true);
    expect(hasClubRole(['président'], 'Président')).toBe(true);
  });

  it('identifies Trésorier and Secrétaire with English synonyms', () => {
    expect(hasClubRole(['Treasurer'], 'Trésorier')).toBe(true);
    expect(hasClubRole(['Trésorier'], 'Trésorier')).toBe(true);
    expect(hasClubRole(['Secretary'], 'Secrétaire')).toBe(true);
    expect(hasClubRole(['Secrétaire'], 'Secrétaire')).toBe(true);
  });

  it('toggles standard role on and off cleanly without duplicates', () => {
    const initial = ['Member', 'Traceur'];
    const withCaptain = toggleClubRole(initial, 'Capitaine de Route', true);
    expect(withCaptain).toContain('Capitaine de Route');
    expect(withCaptain).toContain('Traceur');
    expect(withCaptain).toContain('Member');

    const withoutCaptain = toggleClubRole(withCaptain, 'Capitaine de Route', false);
    expect(withoutCaptain).not.toContain('Capitaine de Route');
    expect(withoutCaptain).toContain('Traceur');
  });

  it('removes duplicate synonyms when toggling a role on or off', () => {
    // If a member had both "Trésorier" and "Treasurer"
    const messy = ['Trésorier', 'Treasurer', 'Admin'];
    const updated = toggleClubRole(messy, 'Trésorier', true);
    // Should contain only one canonical key 'Trésorier'
    expect(updated.filter((r) => r.toLowerCase().includes('trés') || r.toLowerCase().includes('trea'))).toEqual(['Trésorier']);
    expect(updated).toContain('Admin');

    const removed = toggleClubRole(updated, 'Trésorier', false);
    expect(removed).toEqual(['Admin']);
  });

  it('distinguishes standard club roles from custom specialties', () => {
    expect(isStandardClubRole('Capitaine de Route')).toBe(true);
    expect(isStandardClubRole('capitaine')).toBe(true);
    expect(isStandardClubRole('Admin')).toBe(true);
    expect(isStandardClubRole('Président')).toBe(true);
    expect(isStandardClubRole('Member')).toBe(true);

    expect(isStandardClubRole('Traceur')).toBe(false);
    expect(isStandardClubRole('Resp. Calendrier')).toBe(false);
    expect(isStandardClubRole('Resp. maillots')).toBe(false);
  });

  it('extracts custom roles correctly from mixed array', () => {
    const roles = ['Member', 'Admin', 'Traceur', 'Resp. Calendrier'];
    const custom = extractCustomRoles(roles);
    expect(custom).toEqual(['Traceur', 'Resp. Calendrier']);
  });

  it('normalizes roles and defines CLUB_ROLES constant', () => {
    expect(CLUB_ROLES.length).toBeGreaterThan(0);
    expect(normalizeRoles(['  capitaine ', ' Membre '])).toEqual(['capitaine', 'Membre']);
    expect(normalizeRoles(' Admin ')).toEqual(['Admin']);
    expect(normalizeRoles(null)).toEqual([]);
  });

  it('correctly identifies admin roles with isAdminRole', () => {
    expect(isAdminRole('Admin')).toBe(true);
    expect(isAdminRole('admin')).toBe(true);
    expect(isAdminRole('Administrateur')).toBe(true);
    expect(isAdminRole('administrateur')).toBe(true);
    expect(isAdminRole('Président')).toBe(true);
    expect(isAdminRole('president')).toBe(true);
    expect(isAdminRole('webmaster')).toBe(true);
    expect(isAdminRole('WebMaster')).toBe(true);

    expect(isAdminRole('Member')).toBe(false);
    expect(isAdminRole('Capitaine de Route')).toBe(false);
    expect(isAdminRole('Trésorier')).toBe(false);
    expect(isAdminRole('Secrétaire')).toBe(false);
    expect(isAdminRole('Traceur')).toBe(false);
  });

  it('verifies checkIsAdmin with role, email, and negative cases', () => {
    expect(checkIsAdmin({ role: ['Admin'] })).toBe(true);
    expect(checkIsAdmin({ role: ['Président'] })).toBe(true);
    expect(checkIsAdmin({ role: ['president'] })).toBe(true);
    expect(checkIsAdmin({ role: ['webmaster'] })).toBe(true);
    expect(checkIsAdmin({ email: 'admin@blanmont.be' })).toBe(true);
    expect(checkIsAdmin({ email: 'president@blanmont.be' })).toBe(true);
    expect(checkIsAdmin({ email: 'bruyere.nicolas@gmail.com' })).toBe(true);

    expect(checkIsAdmin({ role: ['Member'], email: 'member@blanmont.be' })).toBe(false);
    expect(checkIsAdmin(null)).toBe(false);
    expect(checkIsAdmin(undefined)).toBe(false);
  });

  it('derives ADMIN_ROLES from CLUB_ROLES and verifies ADMIN_EMAILS', () => {
    expect(ADMIN_ROLES.length).toBeGreaterThan(0);
    expect(ADMIN_ROLES).toContain('Admin');
    expect(ADMIN_ROLES).toContain('Président');
    expect(ADMIN_EMAILS).toContain('admin@blanmont.be');
  });
});
