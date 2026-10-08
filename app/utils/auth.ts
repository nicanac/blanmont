/**
 * Authentication and authorization utility wrappers.
 * Roles and admin privilege rules are centrally configured in app/constants/roles.ts.
 */
export {
  ADMIN_ROLES,
  ADMIN_EMAILS,
  isAdminRole,
  checkIsAdmin,
} from '../constants/roles';

