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

      const success = await updateTrialRequestStatus('tr-123', 'archived');
      expect(success).toBe(false);
    });
  });

  describe('getTrialRequestById', () => {
    it('returns single trial request when it exists in database', async () => {
      const mockData = {
        name: 'Émilie Charlier',
        email: 'emilie@example.com',
        phone: '+32478112233',
        status: 'pending',
      };
      const snapshot = {
        exists: () => true,
        val: () => mockData,
      };
      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const { getTrialRequestById } = await import('@/app/lib/firebase/trial-requests');
      const res = await getTrialRequestById('tr-emilie');
      expect(refMock).toHaveBeenCalledWith('trial-requests/tr-emilie');
      expect(res).toEqual({ id: 'tr-emilie', ...mockData });
    });

    it('returns null when trial request is not found', async () => {
      const snapshot = { exists: () => false };
      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const { getTrialRequestById } = await import('@/app/lib/firebase/trial-requests');
      const res = await getTrialRequestById('tr-unknown');
      expect(res).toBeNull();
    });
  });

  describe('updateTrialRequest', () => {
    it('updates arbitrary fields including adminNotes and mentorCaptain', async () => {
      const updateMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ update: updateMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const { updateTrialRequest } = await import('@/app/lib/firebase/trial-requests');
      const success = await updateTrialRequest('tr-456', {
        adminNotes: 'Contacté au téléphone, motivé.',
        mentorCaptainId: 'captain-1',
        mentorCaptainName: 'Marc V.',
      });

      expect(success).toBe(true);
      expect(refMock).toHaveBeenCalledWith('trial-requests/tr-456');
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          adminNotes: 'Contacté au téléphone, motivé.',
          mentorCaptainId: 'captain-1',
          mentorCaptainName: 'Marc V.',
          updatedAt: expect.any(String),
        })
      );
    });

    it('returns false on database update error', async () => {
      const updateMock = vi.fn().mockRejectedValue(new Error('Update failed'));
      const refMock = vi.fn().mockReturnValue({ update: updateMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const { updateTrialRequest } = await import('@/app/lib/firebase/trial-requests');
      const success = await updateTrialRequest('tr-456', { adminNotes: 'Test' });
      expect(success).toBe(false);
    });
  });

  describe('deleteTrialRequest', () => {
    it('removes the trial request record from database', async () => {
      const removeMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ remove: removeMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const { deleteTrialRequest } = await import('@/app/lib/firebase/trial-requests');
      const success = await deleteTrialRequest('tr-789');

      expect(success).toBe(true);
      expect(refMock).toHaveBeenCalledWith('trial-requests/tr-789');
      expect(removeMock).toHaveBeenCalled();
    });

    it('returns false on delete error', async () => {
      const removeMock = vi.fn().mockRejectedValue(new Error('Delete error'));
      const refMock = vi.fn().mockReturnValue({ remove: removeMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const { deleteTrialRequest } = await import('@/app/lib/firebase/trial-requests');
      const success = await deleteTrialRequest('tr-789');
      expect(success).toBe(false);
    });
  });

  describe('convertTrialRequestToMember', () => {
    it('creates a new member in /members and updates trial request status to converted', async () => {
      const mockProspect = {
        id: 'tr-convert',
        name: 'Julien Lambert',
        email: 'julien@example.be',
        phone: '+32475112233',
        preferredGroup: 'B',
        bikeType: 'Route',
        experienceLevel: 'Confirmé',
        message: 'Prêt pour l’adhésion !',
        status: 'ride_3',
        createdAt: '2026-09-01T10:00:00.000Z',
      };

      const setMock = vi.fn().mockResolvedValue(undefined);
      const updateMock = vi.fn().mockResolvedValue(undefined);
      const snapshot = {
        exists: () => true,
        val: () => mockProspect,
      };
      const onceMock = vi.fn().mockResolvedValue(snapshot);

      const refMock = vi.fn((path: string) => {
        if (path === 'trial-requests/tr-convert') {
          return { once: onceMock, update: updateMock };
        }
        if (path.startsWith('members/')) {
          return { set: setMock };
        }
        return { set: setMock, once: onceMock, update: updateMock };
      });

      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const { convertTrialRequestToMember } = await import('@/app/lib/firebase/trial-requests');
      const result = await convertTrialRequestToMember('tr-convert');

      expect(result.success).toBe(true);
      expect(result.memberId).toMatch(/^member_/);
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Julien Lambert',
          email: 'julien@example.be',
          role: ['Membre'],
        })
      );
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'converted',
          convertedMemberId: result.memberId,
        })
      );
    });

    it('returns error if prospect is not found', async () => {
      const snapshot = { exists: () => false };
      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const { convertTrialRequestToMember } = await import('@/app/lib/firebase/trial-requests');
      const result = await convertTrialRequestToMember('non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/introuvable/i);
    });
  });
});

