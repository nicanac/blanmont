import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getLeaderboardEntries,
  updateLeaderboardEntry,
  createLeaderboardEntry,
} from '@/app/lib/firebase/leaderboard';
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

describe('Firebase Leaderboard Service (app/lib/firebase/leaderboard.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getLeaderboardEntries', () => {
    it('fetches leaderboard entries and sorts them descending by rides count', async () => {
      const mockItems = [
        { key: 'lb-1', val: () => ({ name: 'Rider Low', rides: 5, group: 'A' }) },
        { key: 'lb-2', val: () => ({ name: 'Rider High', rides: 22, group: 'A' }) },
        { key: 'lb-3', val: () => ({ name: 'Rider Mid', rides: 14, group: 'B' }) },
      ];

      const snapshot = {
        exists: () => true,
        forEach: (cb: (item: any) => void) => mockItems.forEach(cb),
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const entries = await getLeaderboardEntries();
      expect(entries).toHaveLength(3);
      expect(entries[0].rides).toBe(22);
      expect(entries[1].rides).toBe(14);
      expect(entries[2].rides).toBe(5);
    });

    it('returns empty array when snapshot does not exist', async () => {
      const snapshot = { exists: () => false };
      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const entries = await getLeaderboardEntries();
      expect(entries).toEqual([]);
    });

    it('catches database error and returns empty array', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(adminModule, 'getAdminDatabase').mockImplementation(() => {
        throw new Error('Timeout');
      });

      const entries = await getLeaderboardEntries();
      expect(entries).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('createLeaderboardEntry', () => {
    it('creates a new leaderboard entry with generated ID and timestamp', async () => {
      const setMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ set: setMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const result = await createLeaderboardEntry({
        name: 'New Cyclist',
        rides: 1,
        group: 'C',
        dates: ['2026-05-16'],
      });

      expect(result.success).toBe(true);
      expect(result.id).toMatch(/^entry_/);
      expect(setMock).toHaveBeenCalled();
      const payload = setMock.mock.calls[0][0];
      expect(payload.name).toBe('New Cyclist');
      expect(payload.createdAt).toBeDefined();
    });

    it('handles database error when creating entry', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(adminModule, 'getAdminDatabase').mockImplementation(() => {
        throw new Error('Create failure');
      });

      const result = await createLeaderboardEntry({
        name: 'Fail Cyclist',
        rides: 0,
        group: 'A',
        dates: [],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Create failure');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('updateLeaderboardEntry', () => {
    it('updates leaderboard entry with updatedAt timestamp', async () => {
      const updateMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ update: updateMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const result = await updateLeaderboardEntry('entry-10', {
        rides: 10,
        dates: ['2026-05-16', '2026-05-23'],
      });

      expect(result.success).toBe(true);
      expect(updateMock).toHaveBeenCalled();
      const payload = updateMock.mock.calls[0][0];
      expect(payload.rides).toBe(10);
      expect(payload.updatedAt).toBeDefined();
    });

    it('catches and returns error when update fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(adminModule, 'getAdminDatabase').mockImplementation(() => {
        throw new Error('Update error');
      });

      const result = await updateLeaderboardEntry('entry-10', { rides: 11 });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Update error');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
