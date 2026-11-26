import { CLUB_ROLES, checkIsAdmin, hasClubRole } from '@/app/constants/roles';

/** Club officers: every standard role except the plain "Member" (Capitaine de Route, Trésorier, Secrétaire, ...). */
const OFFICER_ROLES = CLUB_ROLES.filter((r) => r.key !== 'Member');

interface Reviewer {
  role?: string[] | string | null;
  email?: string | null;
  isAdmin?: boolean;
}

/** Who may read and triage feedback reports: administrators and club officers, never plain members. */
export function isFeedbackReviewer(user: Reviewer | null | undefined): boolean {
  if (!user) return false;
  if (user.isAdmin || checkIsAdmin(user)) return true;
  return OFFICER_ROLES.some((r) => hasClubRole(user.role, r.key));
}

/** Label shown next to a reviewer's name in replies ("Trésorier", "Admin", ...). */
export function reviewerRoleLabel(user: Reviewer): string {
  const officer = OFFICER_ROLES.find((r) => hasClubRole(user.role, r.key));
  return officer?.label ?? 'Admin';
}
