import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createRideAction,
  submitVoteAction,
  submitWeekendPollResponseAction,
  deleteWeekendPollResponseAction,
  createWeekendPollAction,
  updateWeekendPollAction,
  deleteWeekendPollAction,
  loginAction,
  logoutAction,
  getCurrentSessionUserAction,
  submitEventReviewAction,
  deleteEventReviewAction,
  updateMemberEmergencyAction,
} from '@/app/actions';
import * as sessionModule from '@/app/lib/auth/session';
import * as firebaseRoot from '@/app/lib/firebase';
import * as pollsModule from '@/app/lib/firebase/polls';
import * as reviewsModule from '@/app/lib/firebase/event-reviews';
import * as adminModule from '@/app/lib/firebase/admin';

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

describe('Server Actions (app/actions.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('createRideAction', () => {
    it('requires admin session and calls createRide', async () => {
      vi.spyOn(sessionModule, 'requireAdminSession').mockResolvedValue({
        id: 'admin-1',
        isAdmin: true,
      } as any);
      const createRideSpy = vi.spyOn(firebaseRoot, 'createRide').mockResolvedValue(undefined as any);

      await createRideAction('2026-04-18', ['trace-1', 'trace-2']);

      expect(sessionModule.requireAdminSession).toHaveBeenCalledTimes(1);
      expect(createRideSpy).toHaveBeenCalledWith('2026-04-18', ['trace-1', 'trace-2']);
    });

    it('rejects invalid inputs with validation error', async () => {
      vi.spyOn(sessionModule, 'requireAdminSession').mockResolvedValue({
        id: 'admin-1',
        isAdmin: true,
      } as any);

      await expect(
        createRideAction('not-a-date', [])
      ).rejects.toThrow(/Validation failed/);
    });
  });

  describe('submitVoteAction', () => {
    it('allows a member to vote for themselves', async () => {
      vi.spyOn(sessionModule, 'getSessionUser').mockResolvedValue({
        id: 'member-10',
        isAdmin: false,
      } as any);
      const submitVoteSpy = vi.spyOn(firebaseRoot, 'submitVote').mockResolvedValue(undefined as any);

      await submitVoteAction('ride-2026-04-18', 'member-10', 'trace-1');

      expect(submitVoteSpy).toHaveBeenCalledWith('ride-2026-04-18', 'member-10', 'trace-1');
    });

    it('prevents a member from voting on behalf of another member', async () => {
      vi.spyOn(sessionModule, 'getSessionUser').mockResolvedValue({
        id: 'member-10',
        isAdmin: false,
      } as any);

      await expect(
        submitVoteAction('ride-2026-04-18', 'member-other', 'trace-1')
      ).rejects.toThrow(/Action non autorisée pour ce membre/);
    });

    it('allows an administrator to vote or adjust vote on behalf of a member', async () => {
      vi.spyOn(sessionModule, 'getSessionUser').mockResolvedValue({
        id: 'admin-1',
        isAdmin: true,
      } as any);
      const submitVoteSpy = vi.spyOn(firebaseRoot, 'submitVote').mockResolvedValue(undefined as any);

      await submitVoteAction('ride-2026-04-18', 'member-other', 'trace-1');

      expect(submitVoteSpy).toHaveBeenCalledWith('ride-2026-04-18', 'member-other', 'trace-1');
    });
  });

  describe('submitWeekendPollResponseAction & deleteWeekendPollResponseAction', () => {
    it('submits a valid poll response when authenticated', async () => {
      vi.spyOn(sessionModule, 'getSessionUser').mockResolvedValue({
        id: 'member-10',
        isAdmin: false,
      } as any);
      vi.spyOn(pollsModule, 'submitPollResponse').mockResolvedValue({ success: true } as any);

      const result = await submitWeekendPollResponseAction({
        pollId: 'poll-1',
        memberId: 'member-10',
        memberName: 'Laurent',
        dayChoice: 'Samedi',
        groupChoice: 'Groupe B',
      });

      expect(result.success).toBe(true);
      expect(pollsModule.submitPollResponse).toHaveBeenCalledWith(
        expect.objectContaining({ memberId: 'member-10', dayChoice: 'Samedi' })
      );
    });

    it('rejects deletion when user does not own response and is not admin', async () => {
      vi.spyOn(sessionModule, 'getSessionUser').mockResolvedValue({
        id: 'member-10',
        isAdmin: false,
      } as any);

      await expect(
        deleteWeekendPollResponseAction('poll-1', 'member-other')
      ).rejects.toThrow(/Action non autorisée/);
    });

    it('allows admin or owner to delete poll response', async () => {
      vi.spyOn(sessionModule, 'getSessionUser').mockResolvedValue({
        id: 'member-10',
        isAdmin: false,
      } as any);
      vi.spyOn(pollsModule, 'deletePollResponse').mockResolvedValue({ success: true } as any);

      const result = await deleteWeekendPollResponseAction('poll-1', 'member-10');
      expect(result.success).toBe(true);
    });
  });

  describe('Weekend Poll Admin Actions', () => {
    it('createWeekendPollAction requires admin and calls createWeekendPoll', async () => {
      vi.spyOn(sessionModule, 'requireAdminSession').mockResolvedValue({ id: 'admin-1', isAdmin: true } as any);
      vi.spyOn(pollsModule, 'createWeekendPoll').mockResolvedValue({ success: true, pollId: 'p-1' } as any);

      const result = await createWeekendPollAction({
        title: 'Sortie Weekend',
        weekendIsoDate: '2026-04-18',
        saturdayRideId: 'ride-1',
        status: 'active',
      } as any);

      expect(result.success).toBe(true);
    });

    it('updateWeekendPollAction requires admin and calls updateWeekendPoll', async () => {
      vi.spyOn(sessionModule, 'requireAdminSession').mockResolvedValue({ id: 'admin-1', isAdmin: true } as any);
      vi.spyOn(pollsModule, 'updateWeekendPoll').mockResolvedValue({ success: true } as any);

      const result = await updateWeekendPollAction('p-1', { status: 'closed' });
      expect(result.success).toBe(true);
    });

    it('deleteWeekendPollAction requires admin and calls deleteWeekendPoll', async () => {
      vi.spyOn(sessionModule, 'requireAdminSession').mockResolvedValue({ id: 'admin-1', isAdmin: true } as any);
      vi.spyOn(pollsModule, 'deleteWeekendPoll').mockResolvedValue({ success: true } as any);

      const result = await deleteWeekendPollAction('p-1');
      expect(result.success).toBe(true);
    });
  });

  describe('Auth Actions (loginAction, logoutAction, getCurrentSessionUserAction)', () => {
    it('loginAction validates credentials and sets session cookie for valid member', async () => {
      vi.spyOn(firebaseRoot, 'validateUser').mockResolvedValue({
        id: 'mem-1',
        email: 'user@blanmont.be',
        name: 'User One',
        role: ['Member'],
      } as any);
      const setCookieSpy = vi.spyOn(sessionModule, 'setSessionCookie').mockResolvedValue({} as any);

      const member = await loginAction('user@blanmont.be', 'validpass');

      expect(member).not.toBeNull();
      expect(member?.name).toBe('User One');
      expect(setCookieSpy).toHaveBeenCalledWith(expect.objectContaining({ id: 'mem-1' }));
    });

    it('loginAction returns null for invalid email format', async () => {
      const member = await loginAction('invalid-email', 'validpass');
      expect(member).toBeNull();
    });

    it('logoutAction clears session cookie', async () => {
      const clearSpy = vi.spyOn(sessionModule, 'clearSessionCookie').mockResolvedValue(undefined);
      await logoutAction();
      expect(clearSpy).toHaveBeenCalledTimes(1);
    });

    it('getCurrentSessionUserAction delegates to getSessionUser', async () => {
      vi.spyOn(sessionModule, 'getSessionUser').mockResolvedValue({
        id: 'mem-1',
        name: 'User One',
      } as any);

      const user = await getCurrentSessionUserAction();
      expect(user?.id).toBe('mem-1');
    });
  });

  describe('Event Reviews Actions', () => {
    it('submitEventReviewAction throws if user is not authenticated', async () => {
      vi.spyOn(sessionModule, 'getSessionUser').mockResolvedValue(null);

      await expect(
        submitEventReviewAction({
          eventId: 'ev-1',
          rating: 5,
          comment: 'Très belle sortie !',
        })
      ).rejects.toThrow(/Vous devez être connecté/);
    });

    it('submitEventReviewAction submits debrief review when authenticated', async () => {
      vi.spyOn(sessionModule, 'getSessionUser').mockResolvedValue({
        id: 'mem-1',
        name: 'Julien',
        isAdmin: false,
      } as any);
      vi.spyOn(reviewsModule, 'submitEventReview').mockResolvedValue({ success: true } as any);

      const result = await submitEventReviewAction({
        eventId: 'ev-1',
        rating: 4,
        comment: 'Bonne moyenne et bonne ambiance',
        effort: 'modere',
        pace: 'parfait',
      });

      expect(result.success).toBe(true);
      expect(reviewsModule.submitEventReview).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: 'ev-1',
          memberId: 'mem-1',
          rating: 4,
        })
      );
    });

    it('deleteEventReviewAction prevents non-owner non-admin from deleting', async () => {
      vi.spyOn(sessionModule, 'getSessionUser').mockResolvedValue({
        id: 'mem-1',
        isAdmin: false,
      } as any);

      await expect(
        deleteEventReviewAction('ev-1', 'mem-other')
      ).rejects.toThrow(/Action non autorisée/);
    });
  });

  describe('updateMemberEmergencyAction', () => {
    it('updates member ICE emergency contact and preferred group in database', async () => {
      vi.spyOn(sessionModule, 'getSessionUser').mockResolvedValue({
        id: 'mem-1',
        name: 'Julien',
      } as any);

      const updateMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ update: updateMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const result = await updateMemberEmergencyAction({
        iceContactName: 'Marie Curie',
        iceContactPhone: '+32470999888',
        preferredGroup: 'A',
      });

      expect(result.success).toBe(true);
      expect(refMock).toHaveBeenCalledWith('members/mem-1');
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          iceContactName: 'Marie Curie',
          iceContactPhone: '+32470999888',
          preferredGroup: 'A',
        })
      );
    });

    it('throws if user is not authenticated', async () => {
      vi.spyOn(sessionModule, 'getSessionUser').mockResolvedValue(null);

      await expect(
        updateMemberEmergencyAction({ iceContactName: 'Marie' })
      ).rejects.toThrow(/Vous devez être connecté/);
    });
  });
});
