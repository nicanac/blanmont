import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parsePdfForPreviewAction,
  saveImportedEventsAction,
  processPdf,
} from '@/app/admin/events/import/actions';
import * as sessionModule from '@/app/lib/auth/session';
import * as adminModule from '@/app/lib/firebase/admin';

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock pdf-parse
const mockPdf = vi.fn();
try {
  const resolved = require.resolve('pdf-parse');
  require.cache[resolved] = {
    id: resolved,
    filename: resolved,
    loaded: true,
    exports: mockPdf,
  } as any;
} catch {
  // Ignore if resolve fails
}

vi.mock('pdf-parse', () => {
  return {
    default: mockPdf,
    __esModule: true,
  };
});

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

    it('parses valid calendar PDF text into structured CalendarEvent objects', async () => {
      vi.spyOn(sessionModule, 'requireAdminSession').mockResolvedValue({
        id: 'admin-1',
        isAdmin: true,
      } as any);

      mockPdf.mockResolvedValue({
        text: 'Samedi 16 mai 2026 Club Blanmont 70-90 8h30 FECHERE\nDimanche 24 mai 2026 Sortie Wavre 80-100 9h00 Place Communale',
      });

      const formData = new FormData();
      const fakeFile = new File(['fake-pdf'], 'programme.pdf', { type: 'application/pdf' });
      formData.set('file', fakeFile);

      const result = await parsePdfForPreviewAction(formData);

      expect(result.success).toBe(true);
      expect(result.events).toBeDefined();
      expect(result.events?.length).toBe(2);
      expect(result.events?.[0].isoDate).toBe('2026-05-16');
      expect(result.events?.[0].location).toBe('Blanmont');
      expect(result.events?.[0].address).toBe('Place de Féchère');
      expect(result.events?.[1].isoDate).toBe('2026-05-24');
      expect(result.events?.[1].location).toBe('Sortie Wavre');
    });

    it('returns error when PDF text has no recognizable events', async () => {
      vi.spyOn(sessionModule, 'requireAdminSession').mockResolvedValue({
        id: 'admin-1',
        isAdmin: true,
      } as any);

      mockPdf.mockResolvedValue({
        text: 'Document sans aucune date de sortie valide.',
      });

      const formData = new FormData();
      const fakeFile = new File(['fake-pdf'], 'empty.pdf', { type: 'application/pdf' });
      formData.set('file', fakeFile);

      const result = await parsePdfForPreviewAction(formData);

      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Aucun événement détecté dans le PDF/);
    });

    it('catches PDF parsing exceptions gracefully', async () => {
      vi.spyOn(sessionModule, 'requireAdminSession').mockResolvedValue({
        id: 'admin-1',
        isAdmin: true,
      } as any);

      mockPdf.mockRejectedValue(new Error('Corrupted PDF header'));

      const formData = new FormData();
      const fakeFile = new File(['corrupted'], 'corrupted.pdf', { type: 'application/pdf' });
      formData.set('file', fakeFile);

      const result = await parsePdfForPreviewAction(formData);

      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Corrupted PDF header/);
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

    it('handles database errors during save', async () => {
      vi.spyOn(sessionModule, 'requireAdminSession').mockResolvedValue({
        id: 'admin-1',
        isAdmin: true,
      } as any);

      const childMock = vi.fn().mockReturnValue({
        set: vi.fn().mockRejectedValue(new Error('Firebase write blocked')),
      });
      const refMock = vi.fn().mockReturnValue({ child: childMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const events: any[] = [
        {
          isoDate: '2026-05-16',
          location: 'Walhain',
        },
      ];

      const result = await saveImportedEventsAction(events);
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Firebase write blocked/);
    });
  });

  describe('processPdf', () => {
    it('executes end-to-end preview and save when valid', async () => {
      vi.spyOn(sessionModule, 'requireAdminSession').mockResolvedValue({
        id: 'admin-1',
        isAdmin: true,
      } as any);

      mockPdf.mockResolvedValue({
        text: 'Samedi 16 mai 2026 Club Blanmont 70-90 8h30 FECHERE',
      });

      const setMock = vi.fn().mockResolvedValue(undefined);
      const childMock = vi.fn().mockReturnValue({ set: setMock });
      const refMock = vi.fn().mockReturnValue({ child: childMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const formData = new FormData();
      const fakeFile = new File(['fake-pdf'], 'prog.pdf', { type: 'application/pdf' });
      formData.set('file', fakeFile);

      const result = await processPdf(formData);
      expect(result.success).toBe(true);
      expect((result as any).count).toBe(1);
    });
  });
});
