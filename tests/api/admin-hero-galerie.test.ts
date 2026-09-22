import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  GET as getHeroRoute,
  POST as postHeroRoute,
  PUT as putHeroRoute,
} from '@/app/api/admin/hero/route';
import {
  GET as getGalerieRoute,
  POST as postGalerieRoute,
  DELETE as deleteGalerieRoute,
} from '@/app/api/admin/galerie/route';
import * as heroModule from '@/app/lib/firebase/hero';
import * as galleriesModule from '@/app/lib/firebase/galleries';
import * as sessionModule from '@/app/lib/auth/session';

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Admin Hero & Galerie API Endpoints', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Hero API (/api/admin/hero)', () => {
    it('GET returns hero settings', async () => {
      const mockSettings = { badge: 'Peloton Blanmont' };
      vi.spyOn(heroModule, 'getHeroSettings').mockResolvedValue(mockSettings as any);

      const res = await getHeroRoute();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.badge).toBe('Peloton Blanmont');
    });

    it('POST & PUT update hero settings when admin authorized', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const updated = { badge: 'Nouveau Badge' };
      vi.spyOn(heroModule, 'updateHeroSettings').mockResolvedValue(updated as any);

      const req = new NextRequest('http://localhost:3000/api/admin/hero', {
        method: 'POST',
        body: JSON.stringify({ badge: 'Nouveau Badge' }),
      });

      const res = await postHeroRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.settings.badge).toBe('Nouveau Badge');

      // Verify PUT delegates to POST with separate request
      const putReq = new NextRequest('http://localhost:3000/api/admin/hero', {
        method: 'PUT',
        body: JSON.stringify({ badge: 'Nouveau Badge' }),
      });
      const putRes = await putHeroRoute(putReq);
      expect(putRes.status).toBe(200);
    });
  });

  describe('Galerie API (/api/admin/galerie)', () => {
    it('GET returns list of photo albums', async () => {
      const mockAlbums = [{ id: 'alb-1', title: 'Sortie Ardennes' }];
      vi.spyOn(galleriesModule, 'getPhotoAlbums').mockResolvedValue(mockAlbums as any);

      const res = await getGalerieRoute();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.albums).toHaveLength(1);
      expect(data.albums[0].title).toBe('Sortie Ardennes');
    });

    it('POST rejects with 400 when required fields are missing', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/galerie', {
        method: 'POST',
        body: JSON.stringify({ title: 'Titre seul' }), // missing coverUrl & category
      });

      const res = await postGalerieRoute(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/Titre, URL de couverture et catégorie sont requis/);
    });

    it('POST creates album when valid', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const newAlb = { id: 'alb-new', title: 'Stage Provence' };
      vi.spyOn(galleriesModule, 'createPhotoAlbum').mockResolvedValue(newAlb as any);

      const req = new NextRequest('http://localhost:3000/api/admin/galerie', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Stage Provence',
          coverUrl: 'https://example.com/cover.jpg',
          category: 'Sorties',
        }),
      });

      const res = await postGalerieRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.album.title).toBe('Stage Provence');
    });

    it('DELETE returns 400 if album id is missing in searchParams', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/galerie'); // no ?id=
      const res = await deleteGalerieRoute(req);
      expect(res.status).toBe(400);
    });

    it('DELETE deletes album when id is present', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      vi.spyOn(galleriesModule, 'deletePhotoAlbum').mockResolvedValue(true);

      const req = new NextRequest('http://localhost:3000/api/admin/galerie?id=alb-123');
      const res = await deleteGalerieRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(galleriesModule.deletePhotoAlbum).toHaveBeenCalledWith('alb-123');
    });
  });
});
