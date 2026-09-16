import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parsePdfForPreviewAction,
  saveImportedEventsAction,
} from '@/app/admin/events/import/actions';
import * as sessionModule from '@/app/lib/auth/session';
import * as adminModule from '@/app/lib/firebase/admin';

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('PDF Calendar Ingestion Actions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('parsePdfForPreviewAction', () => {
    it('requires admin session and returns error when file is missing', async () => {
      vi.spyOn(sessionModule, 'requireAdminSession').mockResolvedValue({
        id: 'admin-1',
        isAdmin: true,
      } as any);

      const formData = new FormData();
      const result = await parsePdfForPreviewAction(formData);

      expect(sessionModule.requireAdminSession).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Aucun fichier fourni/i);
    });
  });

  describe('saveImportedEventsAction', () => {
    it('requires admin session and returns error when events array is empty', async () => {
      vi.spyOn(sessionModule, 'requireAdminSession').mockResolvedValue({
        id: 'admin-1',
        isAdmin: true,
      } as any);

      const result = await saveImportedEventsAction([]);

      expect(sessionModule.requireAdminSession).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Aucun événement/i);
    });

    it('saves events to Firebase calendar-events with formatted IDs', async () => {
      vi.spyOn(sessionModule, 'requireAdminSession').mockResolvedValue({
        id: 'admin-1',
        isAdmin: true,
      } as any);

      const setMock = vi.fn().mockResolvedValue(undefined);
      const childMock = vi.fn().mockReturnValue({ set: setMock });
      const refMock = vi.fn().mockReturnValue({ child: childMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const events: any[] = [
        {
          isoDate: '2026-05-16',
          location: 'Walhain',
          departure: '8h30',
          distances: '70-90',
        },
        {
          isoDate: '2026-05-23',
          location: 'Jodoigne',
          departure: '8h30',
          distances: '80-100',
        },
      ];

      const result = await saveImportedEventsAction(events);

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
      expect(refMock).toHaveBeenCalledWith('calendar-events');
      expect(childMock).toHaveBeenCalledWith('20260516-Walhain');
      expect(childMock).toHaveBeenCalledWith('20260523-Jodoigne');
      expect(setMock).toHaveBeenCalledTimes(2);
    });
  });
});
