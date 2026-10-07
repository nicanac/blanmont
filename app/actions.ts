/**
 * Server Actions Facade
 *
 * Backward-compatible re-export facade routing calls to modular domain actions:
 * - Traces & previews: app/actions/traces.ts
 * - Rides & votes: app/actions/rides.ts
 * - Polls & voting: app/actions/polls.ts
 * - Auth & activation: app/actions/auth.ts
 * - Members & profile: app/actions/members.ts
 * - Events & reviews: app/actions/events.ts
 */

export {
  uploadMapPreview,
  generateMapPreview,
} from './actions/traces';

export {
  createRideAction,
  submitVoteAction,
} from './actions/rides';

export {
  submitWeekendPollResponseAction,
  deleteWeekendPollResponseAction,
  createWeekendPollAction,
  updateWeekendPollAction,
  deleteWeekendPollAction,
  getSaturdaySortieInfoAction,
  triggerAutoCreateWeekendPollAction,
} from './actions/polls';

export {
  loginAction,
  logoutAction,
  getCurrentSessionUserAction,
  requestAccountActivationAction,
} from './actions/auth';

export {
  updateProfilePhotoAction,
  getMemberProfileAction,
  updateMemberEmergencyAction,
} from './actions/members';

export {
  submitEventReviewAction,
  deleteEventReviewAction,
} from './actions/events';
