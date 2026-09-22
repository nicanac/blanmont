import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getActiveWeekendPoll,
  getWeekendPollByDate,
  getAllWeekendPolls,
  getWeekendPollById,
  submitPollResponse,
  deletePollResponse,
  createWeekendPoll,
  updateWeekendPoll,
  deleteWeekendPoll,
} from '@/app/lib/firebase/polls';
import * as adminModule from '@/app/lib/firebase/admin';

// Mock client isMockMode as false so that Realtime DB paths are tested
vi.mock('@/app/lib/firebase/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/lib/firebase/client')>();
  return {
    ...actual,
    isMockMode: false,
    snapshotToArray: vi.fn((snap) => {
      const arr: any[] = [];
      snap.forEach((child: any) => {
        arr.push({ id: child.key, ...child.val() });
      });
      return arr;
    }),
  };
});

describe('Firebase Polls Service (app/lib/firebase/polls.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getActiveWeekendPoll', () => {
    it('returns the closest upcoming active poll', async () => {
      const earlierFutureDate = '2099-05-01';
      const laterFutureDate = '2099-05-10';

      const mockPolls = [
        {
          key: 'poll-1',
          val: () => ({
            title: 'Sortie Prochaine',
            weekendIsoDate: earlierFutureDate,
            status: 'active',
          }),
        },
        {
          key: 'poll-2',
          val: () => ({
            title: 'Sortie Suivante',
            weekendIsoDate: laterFutureDate,
            status: 'active',
          }),
        },
      ];

      const snapshot = {
        exists: () => true,
        forEach: (cb: (item: any) => void) => mockPolls.forEach(cb),
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const poll = await getActiveWeekendPoll();
      expect(poll).not.toBeNull();
      expect(poll?.id).toBe('poll-1'); // closest upcoming active date
      expect(refMock).toHaveBeenCalledWith('weekend-polls');
    });

    it('returns null if no polls exist', async () => {
      const snapshot = { exists: () => false };
      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const poll = await getActiveWeekendPoll();
      expect(poll).toBeNull();
    });
  });

  describe('getAllWeekendPolls & getWeekendPollByDate', () => {
    it('fetches all weekend polls and sorts by date descending', async () => {
      const mockPolls = [
        {
          key: 'p-1',
          val: () => ({ weekendIsoDate: '2026-05-02', title: 'Sortie Mai' }),
        },
        {
          key: 'p-2',
          val: () => ({ weekendIsoDate: '2026-06-06', title: 'Sortie Juin' }),
        },
      ];

      const snapshot = {
        exists: () => true,
        forEach: (cb: (item: any) => void) => mockPolls.forEach(cb),
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const polls = await getAllWeekendPolls();
      expect(polls).toHaveLength(2);
      expect(polls[0].weekendIsoDate).toBe('2026-06-06'); // Descending

      const single = await getWeekendPollByDate('2026-05-02');
      expect(single?.id).toBe('p-1');
    });
  });

  describe('getWeekendPollById', () => {
    it('fetches poll by ID', async () => {
      const snapshot = {
        exists: () => true,
        val: () => ({
          title: 'Sortie Ardennes',
          weekendIsoDate: '2026-07-11',
          status: 'active',
        }),
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const poll = await getWeekendPollById('poll-ardennes');
      expect(poll).not.toBeNull();
      expect(poll?.id).toBe('poll-ardennes');
      expect(poll?.title).toBe('Sortie Ardennes');
      expect(refMock).toHaveBeenCalledWith('weekend-polls/poll-ardennes');
    });

    it('returns null if poll does not exist', async () => {
      const snapshot = { exists: () => false };
      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const poll = await getWeekendPollById('non-existent');
      expect(poll).toBeNull();
    });
  });

  describe('submitPollResponse', () => {
    it('sets member response in weekend-poll-responses ref', async () => {
      const setMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ set: setMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const result = await submitPollResponse({
        pollId: 'poll-1',
        memberId: 'mem-10',
        memberName: 'Julien',
        dayChoice: 'Samedi',
        groupChoice: 'Groupe B',
        comment: 'Présent en forme',
      });

      expect(result.success).toBe(true);
      expect(refMock).toHaveBeenCalledWith('weekend-poll-responses/poll-1/mem-10');
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          memberId: 'mem-10',
          memberName: 'Julien',
          dayChoice: 'Samedi',
          groupChoice: 'Groupe B',
          comment: 'Présent en forme',
        })
      );
    });
  });

  describe('deletePollResponse', () => {
    it('removes member response from poll', async () => {
      const removeMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ remove: removeMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const result = await deletePollResponse('poll-1', 'mem-10');
      expect(result.success).toBe(true);
      expect(refMock).toHaveBeenCalledWith('weekend-poll-responses/poll-1/mem-10');
      expect(removeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('createWeekendPoll', () => {
    it('pushes a new weekend poll and returns id', async () => {
      const setMock = vi.fn().mockResolvedValue(undefined);
      const pushMock = vi.fn().mockReturnValue({
        key: 'new-poll-999',
        set: setMock,
      });
      const refMock = vi.fn().mockReturnValue({ push: pushMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const result = await createWeekendPoll({
        title: 'Sortie Gravel',
        weekendIsoDate: '2026-08-15',
        description: 'Parcours mixte',
        status: 'active',
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe('new-poll-999');
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'new-poll-999',
          title: 'Sortie Gravel',
        })
      );
    });
  });

  describe('updateWeekendPoll & deleteWeekendPoll', () => {
    it('updates weekend poll fields in database', async () => {
      const updateMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ update: updateMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const result = await updateWeekendPoll('poll-1', { status: 'closed' });
      expect(result.success).toBe(true);
      expect(refMock).toHaveBeenCalledWith('weekend-polls/poll-1');
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'closed' })
      );
    });

    it('deletes weekend poll and responses from database', async () => {
      const removeMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ remove: removeMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const result = await deleteWeekendPoll('poll-1');
      expect(result.success).toBe(true);
      expect(refMock).toHaveBeenCalledWith('weekend-polls/poll-1');
      expect(refMock).toHaveBeenCalledWith('weekend-poll-responses/poll-1');
      expect(removeMock).toHaveBeenCalledTimes(2);
    });
  });
});
