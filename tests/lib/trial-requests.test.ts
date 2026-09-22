import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createTrialRequest,
  getTrialRequests,
  updateTrialRequestStatus,
} from '@/app/lib/firebase/trial-requests';
import * as adminModule from '@/app/lib/firebase/admin';

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

describe('Firebase Trial Requests Service (app/lib/firebase/trial-requests.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('createTrialRequest', () => {
    it('creates a new trial request with status pending and saves to Realtime Database', async () => {
      const setMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ set: setMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const request = await createTrialRequest({
        name: 'Alexandre Dumas',
        email: 'alexandre@example.be',
        phone: '+32470112233',
        preferredGroup: 'B',
        bikeType: 'Route',
        experienceLevel: 'Débutant',
        firstRideDate: '2026-05-16',
        message: 'Je souhaite faire une sortie découverte',
      });

      expect(request.id).toMatch(/^trial_/);
      expect(request.status).toBe('pending');
      expect(request.createdAt).toBeDefined();
      expect(refMock).toHaveBeenCalledWith(expect.stringContaining('trial-requests/trial_'));
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Alexandre Dumas',
          status: 'pending',
        })
      );
    });
  });

  describe('getTrialRequests', () => {
    it('fetches all trial requests and sorts by createdAt descending', async () => {
      const mockSnapshots = [
        {
          key: 'tr-1',
          val: () => ({ name: 'Thomas', createdAt: '2026-05-01T10:00:00.000Z' }),
        },
        {
          key: 'tr-2',
          val: () => ({ name: 'Sophie', createdAt: '2026-05-02T12:00:00.000Z' }),
        },
      ];

      const snapshot = {
        exists: () => true,
        forEach: (cb: (item: any) => void) => mockSnapshots.forEach(cb),
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const requests = await getTrialRequests();
      expect(requests).toHaveLength(2);
      expect(requests[0].id).toBe('tr-2'); // Most recent first
      expect(requests[1].id).toBe('tr-1');
      expect(refMock).toHaveBeenCalledWith('trial-requests');
    });

    it('returns empty array if no requests exist or on database error', async () => {
      const snapshot = { exists: () => false };
      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const requests = await getTrialRequests();
      expect(requests).toEqual([]);
    });
  });

  describe('updateTrialRequestStatus', () => {
    it('updates status of specific trial request', async () => {
      const setMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ set: setMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const success = await updateTrialRequestStatus('tr-123', 'contacted');
      expect(success).toBe(true);
      expect(refMock).toHaveBeenCalledWith('trial-requests/tr-123/status');
      expect(setMock).toHaveBeenCalledWith('contacted');
    });

    it('returns false when database error occurs', async () => {
      const refMock = vi.fn().mockReturnValue({
        set: vi.fn().mockRejectedValue(new Error('Permission denied')),
      });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const success = await updateTrialRequestStatus('tr-123', 'approved');
      expect(success).toBe(false);
    });
  });
});
