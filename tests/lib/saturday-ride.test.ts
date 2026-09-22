import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getActiveRides,
  getAllRides,
  createRide,
  updateRide,
  getVotes,
  submitVote,
  deleteVote,
} from '@/app/lib/firebase/saturday-ride';
import * as adminModule from '@/app/lib/firebase/admin';
import * as clientModule from '@/app/lib/firebase/client';

vi.mock('@/app/lib/firebase/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/lib/firebase/client')>();
  return {
    ...actual,
    isMockMode: false,
    useNotionFallback: false,
    getFirebaseDatabase: vi.fn(),
    ref: vi.fn((db, path) => ({ db, path })),
    get: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
    snapshotToArray: vi.fn((snap) => {
      const arr: any[] = [];
      snap.forEach((child: any) => {
        arr.push({ id: child.key, ...child.val() });
      });
      return arr;
    }),
  };
});

describe('Firebase Saturday Ride Service (app/lib/firebase/saturday-ride.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getActiveRides', () => {
    it('fetches rides on server side using admin DB and filters for status === "Voting"', async () => {
      const mockItems = [
        { key: 'ride-2', val: () => ({ date: '2026-05-30', status: 'Voting', candidateTraceIds: ['t2'] }) },
        { key: 'ride-1', val: () => ({ date: '2026-05-23', status: 'Voting', candidateTraceIds: ['t1'] }) },
        { key: 'ride-old', val: () => ({ date: '2026-05-16', status: 'Archived', candidateTraceIds: ['t0'] }) },
      ];

      const snapshot = {
        exists: () => true,
        forEach: (cb: (item: any) => void) => mockItems.forEach(cb),
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const rides = await getActiveRides();
      expect(refMock).toHaveBeenCalledWith('saturday-rides');
      expect(rides).toHaveLength(2);
      expect(rides[0].id).toBe('ride-1'); // Sorted chronologically
      expect(rides[1].id).toBe('ride-2');
    });

    it('returns empty array when snapshot does not exist', async () => {
      const snapshot = {
        exists: () => false,
      };
      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const rides = await getActiveRides();
      expect(rides).toEqual([]);
    });

    it('returns empty array and logs error when DB call throws', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const refMock = vi.fn().mockImplementation(() => {
        throw new Error('Connection refused');
      });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const rides = await getActiveRides();
      expect(rides).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getAllRides', () => {
    it('fetches all rides and sorts them by date', async () => {
      const mockItems = [
        { key: 'ride-2', val: () => ({ date: '2026-06-01', status: 'Planned' }) },
        { key: 'ride-1', val: () => ({ date: '2026-05-01', status: 'Completed' }) },
      ];
      const snapshot = {
        exists: () => true,
        forEach: (cb: (item: any) => void) => mockItems.forEach(cb),
      };

      vi.spyOn(clientModule, 'get').mockResolvedValue(snapshot as any);

      const rides = await getAllRides();
      expect(rides).toHaveLength(2);
      expect(rides[0].id).toBe('ride-1');
      expect(rides[1].id).toBe('ride-2');
    });

    it('handles empty snapshot', async () => {
      const snapshot = { exists: () => false };
      vi.spyOn(clientModule, 'get').mockResolvedValue(snapshot as any);

      const rides = await getAllRides();
      expect(rides).toEqual([]);
    });
  });

  describe('createRide', () => {
    it('saves a new ride with status "Voting"', async () => {
      const setMock = vi.spyOn(clientModule, 'set').mockResolvedValue(undefined as any);

      await createRide('2026-06-06', ['trace-1', 'trace-2']);
      expect(setMock).toHaveBeenCalled();
      const callArgs = setMock.mock.calls[0];
      expect(callArgs[1]).toMatchObject({
        date: '2026-06-06',
        candidateTraceIds: ['trace-1', 'trace-2'],
        status: 'Voting',
      });
    });

    it('throws error when database write fails', async () => {
      vi.spyOn(clientModule, 'set').mockRejectedValue(new Error('Write failed'));
      await expect(createRide('2026-06-06', [])).rejects.toThrow('Write failed');
    });
  });

  describe('updateRide', () => {
    it('updates ride status and selectedTraceId', async () => {
      const updateMock = vi.spyOn(clientModule, 'update').mockResolvedValue(undefined as any);

      await updateRide('ride-123', { status: 'Completed', selectedTraceId: 'trace-1' });
      expect(updateMock).toHaveBeenCalled();
      const callArgs = updateMock.mock.calls[0];
      expect(callArgs[1]).toMatchObject({
        status: 'Completed',
        selectedTraceId: 'trace-1',
      });
      expect(callArgs[1].updatedAt).toBeDefined();
    });
  });

  describe('getVotes', () => {
    it('fetches votes and filters by rideId', async () => {
      const mockVotes = [
        { key: 'v1', val: () => ({ rideId: 'ride-1', memberId: 'm1', traceId: 't1' }) },
        { key: 'v2', val: () => ({ rideId: 'ride-2', memberId: 'm2', traceId: 't2' }) },
        { key: 'v3', val: () => ({ rideId: 'ride-1', memberId: 'm3', traceId: 't2' }) },
      ];
      const snapshot = {
        exists: () => true,
        forEach: (cb: (item: any) => void) => mockVotes.forEach(cb),
      };

      vi.spyOn(clientModule, 'get').mockResolvedValue(snapshot as any);

      const votes = await getVotes('ride-1');
      expect(votes).toHaveLength(2);
      expect(votes.every((v) => v.rideId === 'ride-1')).toBe(true);
    });

    it('returns empty array if no votes exist', async () => {
      const snapshot = { exists: () => false };
      vi.spyOn(clientModule, 'get').mockResolvedValue(snapshot as any);

      const votes = await getVotes('ride-empty');
      expect(votes).toEqual([]);
    });
  });

  describe('submitVote', () => {
    it('creates a new vote if member has not voted yet', async () => {
      const emptySnapshot = { exists: () => false };
      vi.spyOn(clientModule, 'get').mockResolvedValue(emptySnapshot as any);
      const setMock = vi.spyOn(clientModule, 'set').mockResolvedValue(undefined as any);

      await submitVote('ride-1', 'member-10', 'trace-A');
      expect(setMock).toHaveBeenCalled();
      const callArgs = setMock.mock.calls[0];
      expect(callArgs[1]).toMatchObject({
        rideId: 'ride-1',
        memberId: 'member-10',
        traceId: 'trace-A',
      });
    });

    it('updates existing vote if member already voted', async () => {
      const existingVote = [
        { key: 'v-existing', val: () => ({ rideId: 'ride-1', memberId: 'member-10', traceId: 'trace-Old' }) },
      ];
      const snapshot = {
        exists: () => true,
        forEach: (cb: (item: any) => void) => existingVote.forEach(cb),
      };
      vi.spyOn(clientModule, 'get').mockResolvedValue(snapshot as any);
      const updateMock = vi.spyOn(clientModule, 'update').mockResolvedValue(undefined as any);

      await submitVote('ride-1', 'member-10', 'trace-New');
      expect(updateMock).toHaveBeenCalled();
      const callArgs = updateMock.mock.calls[0];
      expect(callArgs[1]).toMatchObject({
        traceId: 'trace-New',
      });
    });
  });

  describe('deleteVote', () => {
    it('sets the vote reference to null', async () => {
      const setMock = vi.spyOn(clientModule, 'set').mockResolvedValue(undefined as any);
      await deleteVote('vote-to-delete');
      expect(setMock).toHaveBeenCalled();
      const callArgs = setMock.mock.calls[0];
      expect(callArgs[1]).toBeNull();
    });
  });
});
