import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getEventAttendance,
  getAllAttendance,
  setEventAttendance,
  addMemberAttendance,
  removeMemberAttendance,
} from '@/app/lib/firebase/attendance';
import * as adminModule from '@/app/lib/firebase/admin';

vi.mock('@/app/lib/firebase/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/lib/firebase/client')>();
  return {
    ...actual,
    isMockMode: false,
    getFirebaseDatabase: vi.fn(),
    ref: vi.fn((db, path) => ({ db, path })),
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  };
});

describe('Firebase Attendance Service (app/lib/firebase/attendance.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getEventAttendance', () => {
    it('fetches event attendance by ID on server using Admin SDK', async () => {
      const mockData = {
        isoDate: '2026-05-16',
        members: {
          'm-1': { memberId: 'm-1', name: 'Alain Dupont', group: 'A', markedAt: '2026-05-16T08:30:00Z' },
        },
        updatedAt: '2026-05-16T09:00:00Z',
      };

      const snapshot = {
        exists: () => true,
        val: () => mockData,
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const attendance = await getEventAttendance('ev-100');
      expect(refMock).toHaveBeenCalledWith('attendance/ev-100');
      expect(attendance).not.toBeNull();
      expect(attendance?.eventId).toBe('ev-100');
      expect(attendance?.isoDate).toBe('2026-05-16');
      expect(attendance?.members['m-1'].name).toBe('Alain Dupont');
    });

    it('returns null when attendance does not exist', async () => {
      const snapshot = { exists: () => false };
      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const attendance = await getEventAttendance('ev-missing');
      expect(attendance).toBeNull();
    });

    it('returns null when DB read throws', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(adminModule, 'getAdminDatabase').mockImplementation(() => {
        throw new Error('Connection failed');
      });

      const attendance = await getEventAttendance('ev-error');
      expect(attendance).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getAllAttendance', () => {
    it('fetches all attendance entries and maps them', async () => {
      const mockRecords = {
        'ev-1': {
          isoDate: '2026-05-16',
          members: { 'm-1': { memberId: 'm-1', name: 'Alain', group: 'A', markedAt: '...' } },
        },
        'ev-2': {
          isoDate: '2026-05-23',
          members: {},
        },
      };

      const snapshot = {
        exists: () => true,
        val: () => mockRecords,
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const all = await getAllAttendance();
      expect(all).toHaveLength(2);
      expect(all[0].eventId).toBe('ev-1');
      expect(all[1].eventId).toBe('ev-2');
    });

    it('returns empty array when none exist', async () => {
      const snapshot = { exists: () => false };
      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const all = await getAllAttendance();
      expect(all).toEqual([]);
    });
  });

  describe('setEventAttendance', () => {
    it('sets full event attendance record', async () => {
      const setMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ set: setMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const members = {
        'm-1': { memberId: 'm-1', name: 'Alain', group: 'A', markedAt: '...' },
      };

      const result = await setEventAttendance('ev-10', '2026-05-30', members);
      expect(result.success).toBe(true);
      expect(refMock).toHaveBeenCalledWith('attendance/ev-10');
      expect(setMock).toHaveBeenCalled();
      const saved = setMock.mock.calls[0][0];
      expect(saved.isoDate).toBe('2026-05-30');
      expect(saved.members).toEqual(members);
    });

    it('catches and returns error on set failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(adminModule, 'getAdminDatabase').mockImplementation(() => {
        throw new Error('Save error');
      });

      const result = await setEventAttendance('ev-10', '2026-05-30', {});
      expect(result.success).toBe(false);
      expect(result.error).toContain('Save error');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('addMemberAttendance & removeMemberAttendance', () => {
    it('adds single member to event attendance and updates updatedAt', async () => {
      const setMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ set: setMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const result = await addMemberAttendance('ev-20', '2026-06-06', {
        memberId: 'm-5',
        name: 'Nicolas B',
        group: 'B',
        markedAt: '',
      });

      expect(result.success).toBe(true);
      expect(refMock).toHaveBeenCalledWith('attendance/ev-20/isoDate');
      expect(refMock).toHaveBeenCalledWith('attendance/ev-20/members/m-5');
      expect(refMock).toHaveBeenCalledWith('attendance/ev-20/updatedAt');
    });

    it('removes single member from event attendance', async () => {
      const removeMock = vi.fn().mockResolvedValue(undefined);
      const setMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn((path: string) => {
        if (path.includes('updatedAt')) return { set: setMock };
        return { remove: removeMock };
      });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const result = await removeMemberAttendance('ev-20', 'm-5');
      expect(result.success).toBe(true);
      expect(refMock).toHaveBeenCalledWith('attendance/ev-20/members/m-5');
      expect(removeMock).toHaveBeenCalled();
    });
  });
});
