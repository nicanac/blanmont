import { User } from '../types';

export const ADMIN_ROLES = ['Admin', 'President', 'admin', 'president', 'WebMaster', 'webmaster'];
export const ADMIN_EMAILS = ['admin@blanmont.be', 'president@blanmont.be', 'bruyere.nicolas@gmail.com'];

/**
 * Checks if a user has admin privileges based on roles, email, or stored member session data.
 */
export function checkIsAdmin(user: User | null): boolean {
    if (!user) {
        if (typeof window !== 'undefined') {
            const storedMember = localStorage.getItem('memberData');
            if (storedMember) {
                try {
                    const member = JSON.parse(storedMember);
                    const memberRoles = Array.isArray(member.role) ? member.role : (member.role ? [member.role] : []);
                    if (memberRoles.some((role: string) => ADMIN_ROLES.some((ar) => ar.toLowerCase() === String(role).toLowerCase()))) {
                        return true;
                    }
                    if (member.email && ADMIN_EMAILS.some((ae) => ae.toLowerCase() === String(member.email).toLowerCase())) {
                        return true;
                    }
                } catch {
                    // ignore error
                }
            }
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    const userRoles = Array.isArray(parsed.role) ? parsed.role : (parsed.role ? [parsed.role] : []);
                    if (userRoles.some((role: string) => ADMIN_ROLES.some((ar) => ar.toLowerCase() === String(role).toLowerCase()))) {
                        return true;
                    }
                    if (parsed.email && ADMIN_EMAILS.some((ae) => ae.toLowerCase() === String(parsed.email).toLowerCase())) {
                        return true;
                    }
                } catch {
                    // ignore error
                }
            }
        }
        return false;
    }

    const userRoles = Array.isArray(user.role) ? user.role : (user.role ? [user.role] : []);
    if (userRoles.some((role: string) => ADMIN_ROLES.some((ar) => ar.toLowerCase() === String(role).toLowerCase()))) {
        return true;
    }
    if (user.email && ADMIN_EMAILS.some((ae) => ae.toLowerCase() === String(user.email).toLowerCase())) {
        return true;
    }

    if (typeof window !== 'undefined') {
        const storedMember = localStorage.getItem('memberData');
        if (storedMember) {
            try {
                const member = JSON.parse(storedMember);
                const memberRoles = Array.isArray(member.role) ? member.role : (member.role ? [member.role] : []);
                if (memberRoles.some((role: string) => ADMIN_ROLES.some((ar) => ar.toLowerCase() === String(role).toLowerCase()))) {
                    return true;
                }
                if (member.email && ADMIN_EMAILS.some((ae) => ae.toLowerCase() === String(member.email).toLowerCase())) {
                    return true;
                }
            } catch {
                // ignore error
            }
        }
    }
    return false;
}
