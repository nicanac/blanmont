import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getKomootImage,
  getTrace,
  getTraces,
  getTracesSchema,
  createTrace,
  updateTrace,
  deleteTrace,
  updateTraceMapPreview,
  createTraceFromAdmin,
  submitMapPreview,
  createTraceWithGPX,
  revalidateTracesCache,
  revalidateTraceCache,
} from '@/app/lib/firebase/traces';
import * as adminModule from '@/app/lib/firebase/admin';
import * as clientModule from '@/app/lib/firebase/client';
import * as cacheModule from 'next/cache';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

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
    remove: vi.fn(),
    snapshotToArray: vi.fn((snap) => {
      const arr: any[] = [];
      snap.forEach((child: any) => {
        arr.push({ id: child.key, ...child.val() });
      });
      return arr;
    }),
    snapshotToObject: vi.fn((snap, id) => {
      if (!snap || !snap.exists()) return null;
      return { id, ...snap.val() };
    }),
  };
});

describe('Firebase Traces Service (app/lib/firebase/traces.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getKomootImage', () => {
    it('returns undefined if url is falsy or does not include komoot', async () => {
      expect(await getKomootImage('')).toBeUndefined();
      expect(await getKomootImage('https://strava.com/routes/123')).toBeUndefined();
    });

    it('extracts og:image url from Komoot page HTML', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        text: async () => '<html><head><meta property="og:image" content="https://komoot.com/img/tour.jpg" /></head></html>',
      } as any);

      const img = await getKomootImage('https://www.komoot.com/tour/12345');
      expect(img).toBe('https://komoot.com/img/tour.jpg');
    });

    it('returns undefined if fetch fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      const img = await getKomootImage('https://www.komoot.com/tour/fail');
      expect(img).toBeUndefined();
    });
  });

  describe('getTrace (uncached/cached)', () => {
    it('fetches a trace by ID using admin SDK on server', async () => {
      const mockTraceData = {
        name: 'Boucle Brabant Wallon',
        distance: 85,
        elevation: 650,
        mapUrl: 'https://www.komoot.com/tour/999',
        photoUrl: 'https://images.blanmont.be/trace.jpg',
      };

      const snapshot = {
        exists: () => true,
        val: () => mockTraceData,
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const trace = await getTrace('trace-85');
      expect(trace).not.toBeNull();
      expect(trace?.id).toBe('trace-85');
      expect(trace?.name).toBe('Boucle Brabant Wallon');
    });

    it('fetches komoot image when trace has mapUrl but no photoUrl', async () => {
      const mockTraceData = {
        name: 'Komoot Ride',
        distance: 70,
        mapUrl: 'https://www.komoot.com/tour/777',
        photoUrl: '',
      };

      const snapshot = {
        exists: () => true,
        val: () => mockTraceData,
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      global.fetch = vi.fn().mockResolvedValue({
        text: async () => '<meta property="og:image" content="https://komoot.com/pic.jpg">',
      } as any);

      const trace = await getTrace('trace-komoot');
      expect(trace?.photoUrl).toBe('https://komoot.com/pic.jpg');
    });

    it('returns null when trace snapshot does not exist', async () => {
      const snapshot = { exists: () => false };
      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const trace = await getTrace('non-existent');
      expect(trace).toBeNull();
    });
  });

  describe('getTraces', () => {
    it('fetches all traces and populates missing photos for komoot urls', async () => {
      const mockItems = [
        {
          key: 't1',
          val: () => ({ name: 'Trace 1', mapUrl: 'https://www.komoot.com/tour/1', photoUrl: '' }),
        },
        {
          key: 't2',
          val: () => ({ name: 'Trace 2', mapUrl: 'https://strava.com', photoUrl: 'https://my.photo.jpg' }),
        },
      ];

      const snapshot = {
        exists: () => true,
        forEach: (cb: (item: any) => void) => mockItems.forEach(cb),
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      global.fetch = vi.fn().mockResolvedValue({
        text: async () => '<meta property="og:image" content="https://komoot.com/image1.jpg">',
      } as any);

      const traces = await getTraces();
      expect(traces).toHaveLength(2);
      expect(traces[0].photoUrl).toBe('https://komoot.com/image1.jpg');
      expect(traces[1].photoUrl).toBe('https://my.photo.jpg');
    });

    it('returns empty array when error occurs', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(adminModule, 'getAdminDatabase').mockImplementation(() => {
        throw new Error('Database down');
      });

      const traces = await getTraces();
      expect(traces).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getTracesSchema', () => {
    it('returns predefined filter options for directions, surfaces, and ratings', async () => {
      const schema = await getTracesSchema();
      expect(schema.direction).toContain('Nord');
      expect(schema.surface).toContain('Road');
      expect(schema.rating).toContain('⭐⭐⭐⭐⭐');
    });
  });

  /**
   * Writes go through the Admin SDK (the RTDB rules deny every Web SDK write, #254):
   * `db.ref(path).set/update/remove`, never the Web SDK helpers.
   */
  function mockAdminWrites() {
    const set = vi.fn().mockResolvedValue(undefined);
    const update = vi.fn().mockResolvedValue(undefined);
    const remove = vi.fn().mockResolvedValue(undefined);
    const ref = vi.fn().mockReturnValue({ set, update, remove });
    vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref } as any);
    const web = {
      set: vi.spyOn(clientModule, 'set'),
      update: vi.spyOn(clientModule, 'update'),
      remove: vi.spyOn(clientModule, 'remove'),
    };
    return { ref, set, update, remove, web };
  }

  describe('createTrace', () => {
    it('validates and creates a new trace through the Admin SDK', async () => {
      const db = mockAdminWrites();

      const result = await createTrace({
        name: 'Sortie des Abbayes',
        distance: 92,
        elevation: 810,
        surface: 'Road',
        rating: '⭐⭐⭐⭐',
        polyline: '_p~iF~ps|U_ulLnnqC',
      });

      expect(result.success).toBe(true);
      expect(result.id).toMatch(/^trace_/);
      expect(db.ref).toHaveBeenCalledWith(`traces/${result.id}`);
      expect(db.set).toHaveBeenCalledTimes(1);
      const saved = db.set.mock.calls[0][0];
      expect(saved.name).toBe('Sortie des Abbayes');
      expect(saved.quality).toBe(4);
      expect(saved.polyline).toBe('_p~iF~ps|U_ulLnnqC');
      expect(db.web.set).not.toHaveBeenCalled();
    });

    it('fails validation when required fields are missing or invalid', async () => {
      const db = mockAdminWrites();
      const result = await createTrace({
        name: '', // Empty name
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(db.set).not.toHaveBeenCalled();
    });

    it('reports a failed write instead of claiming success', async () => {
      const db = mockAdminWrites();
      db.set.mockRejectedValue(new Error('PERMISSION_DENIED'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await createTrace({ name: 'Boucle', distance: 50 });
      expect(result.success).toBe(false);
      expect(result.error).toContain('PERMISSION_DENIED');
    });
  });

  describe('updateTrace & deleteTrace', () => {
    it('updates trace attributes and recalculates quality from rating', async () => {
      const db = mockAdminWrites();

      const result = await updateTrace('trace-10', {
        name: 'Updated Name',
        rating: '⭐⭐⭐⭐⭐',
      });

      expect(result.success).toBe(true);
      expect(db.ref).toHaveBeenCalledWith('traces/trace-10');
      const payload = db.update.mock.calls[0][0];
      expect(payload.quality).toBe(5);
      expect(payload.name).toBe('Updated Name');
      expect(db.web.update).not.toHaveBeenCalled();
    });

    it('removes trace and revalidates cache', async () => {
      const db = mockAdminWrites();

      const result = await deleteTrace('trace-delete-me');
      expect(result.success).toBe(true);
      expect(db.ref).toHaveBeenCalledWith('traces/trace-delete-me');
      expect(db.remove).toHaveBeenCalledTimes(1);
      expect(db.web.remove).not.toHaveBeenCalled();
      expect(cacheModule.revalidatePath).toHaveBeenCalledWith('/traces/trace-delete-me');
    });
  });

  describe('updateTraceMapPreview & submitMapPreview', () => {
    it('updates photoUrl for a trace', async () => {
      const db = mockAdminWrites();

      const result = await updateTraceMapPreview('t-preview', 'https://res.cloudinary.com/preview.png');
      expect(result.success).toBe(true);
      expect(db.ref).toHaveBeenCalledWith('traces/t-preview');
      expect(db.update.mock.calls[0][0].photoUrl).toBe('https://res.cloudinary.com/preview.png');
    });

    it('submitMapPreview succeeds or throws on error', async () => {
      const db = mockAdminWrites();
      await expect(submitMapPreview('t-1', 'https://pic.png')).resolves.not.toThrow();

      db.update.mockRejectedValue(new Error('Update error'));
      vi.spyOn(console, 'error').mockImplementation(() => {});
      await expect(submitMapPreview('t-1', 'https://pic.png')).rejects.toThrow();
    });
  });

  describe('createTraceFromAdmin & createTraceWithGPX', () => {
    it('creates trace with admin fields', async () => {
      const db = mockAdminWrites();

      const result = await createTraceFromAdmin({
        name: 'Admin Trace',
        date: '2026-06-15',
        distance: 105,
        elevation: 1100,
        rating: '⭐⭐⭐',
      });

      expect(result.success).toBe(true);
      expect(db.ref).toHaveBeenCalledWith(`traces/${result.id}`);
      expect(db.set.mock.calls[0][0].quality).toBe(3);
    });

    it('creates trace with complete GPX content and metadata', async () => {
      const db = mockAdminWrites();

      const result = await createTraceWithGPX(
        {
          name: 'GPX Full Trace',
          date: '2026-07-04',
          distance: 68,
          elevation: 450,
        },
        '<gpx>sample</gpx>'
      );

      expect(result.success).toBe(true);
      const saved = db.set.mock.calls[0][0];
      expect(saved.gpxContent).toBe('<gpx>sample</gpx>');
      expect(saved.distance).toBe(68);
      expect(db.web.set).not.toHaveBeenCalled();
    });
  });

  describe('Cache Revalidation', () => {
    it('revalidates traces cache paths', async () => {
      await revalidateTracesCache();
      expect(cacheModule.revalidatePath).toHaveBeenCalledWith('/traces');

      await revalidateTraceCache('trace-id-123');
      expect(cacheModule.revalidatePath).toHaveBeenCalledWith('/traces/trace-id-123');
    });
  });
});
