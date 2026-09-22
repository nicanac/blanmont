import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { POST as createBlogRoute } from '@/app/api/admin/blog/route';
import {
  GET as getBlogByIdRoute,
  PUT as updateBlogByIdRoute,
  DELETE as deleteBlogByIdRoute,
} from '@/app/api/admin/blog/[id]/route';
import * as blogModule from '@/app/lib/firebase/blog';
import * as sessionModule from '@/app/lib/auth/session';

describe('Admin Blog API Endpoints', () => {
  const mockContext = {
    params: Promise.resolve({ id: 'post-123' }),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/admin/blog', () => {
    it('requires admin authorization', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/blog', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test Article' }),
      });

      const res = await createBlogRoute(req);
      expect(res.status).toBe(401);
    });

    it('generates slug from title and creates post in database', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      vi.spyOn(blogModule, 'createBlogPost').mockResolvedValue('new-blog-999');

      const req = new NextRequest('http://localhost:3000/api/admin/blog', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Sortie d’automne sous la pluie !',
          excerpt: 'Récit épique',
          content: '<p>Superbe peloton</p>',
          author: 'Laurent',
          category: 'Sorties',
        }),
      });

      const res = await createBlogRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.id).toBe('new-blog-999');

      expect(blogModule.createBlogPost).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Sortie d’automne sous la pluie !',
          slug: expect.stringMatching(/sortie-dautomne-sous-la-pluie/),
        })
      );
    });
  });

  describe('GET /api/admin/blog/[id]', () => {
    it('returns 404 when post is not found', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      vi.spyOn(blogModule, 'getBlogPostById').mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/admin/blog/post-123');
      const res = await getBlogByIdRoute(req, mockContext);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('Post not found');
    });

    it('returns post data when found', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const mockPost = {
        id: 'post-123',
        title: 'Chronique du dimanche',
      };
      vi.spyOn(blogModule, 'getBlogPostById').mockResolvedValue(mockPost as any);

      const req = new NextRequest('http://localhost:3000/api/admin/blog/post-123');
      const res = await getBlogByIdRoute(req, mockContext);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.title).toBe('Chronique du dimanche');
    });
  });

  describe('PUT /api/admin/blog/[id]', () => {
    it('updates post in database', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      vi.spyOn(blogModule, 'updateBlogPost').mockResolvedValue(undefined as any);

      const req = new NextRequest('http://localhost:3000/api/admin/blog/post-123', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Titre Modifié' }),
      });

      const res = await updateBlogByIdRoute(req, mockContext);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(blogModule.updateBlogPost).toHaveBeenCalledWith('post-123', { title: 'Titre Modifié' });
    });
  });

  describe('DELETE /api/admin/blog/[id]', () => {
    it('deletes post from database', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      vi.spyOn(blogModule, 'deleteBlogPost').mockResolvedValue(undefined as any);

      const req = new NextRequest('http://localhost:3000/api/admin/blog/post-123', {
        method: 'DELETE',
      });

      const res = await deleteBlogByIdRoute(req, mockContext);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(blogModule.deleteBlogPost).toHaveBeenCalledWith('post-123');
    });
  });
});
