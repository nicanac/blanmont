import { User } from '../types';

export const ADMIN_ROLES = [
  'Admin',
  'admin',
  'Administrateur',
  'administrateur',
  'President',
  'president',
  'Président',
  'président',
  'WebMaster',
  'webmaster',
];
export const ADMIN_EMAILS = ['admin@blanmont.be', 'president@blanmont.be', 'bruyere.nicolas@gmail.com'];

/**
 * Checks if a user has admin privileges based on roles, email, or stored member session data.
 */
export function checkIsAdmin(user: User | null): boolean {
    if (!user) {
        return false;
    }

    const userRoles = Array.isArray(user.role) ? user.role : (user.role ? [user.role] : []);
    if (userRoles.some((role: string) => ADMIN_ROLES.some((ar) => ar.toLowerCase() === String(role).toLowerCase()))) {
        return true;
    }
    if (user.email && ADMIN_EMAILS.some((ae) => ae.toLowerCase() === String(user.email).toLowerCase())) {
        return true;
    }

    return false;
}
