import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getBlogPosts,
  getBlogPostBySlug,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  seedBlogPosts,
  revalidateBlogCache,
  revalidateBlogPostCache,
} from '@/app/lib/firebase/blog';
import * as adminModule from '@/app/lib/firebase/admin';
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
    snapshotToArray: vi.fn((snap) => {
      const arr: any[] = [];
      snap.forEach((child: any) => {
        arr.push({ id: child.key, ...child.val() });
      });
      return arr;
    }),
  };
});

describe('Firebase Blog Service (app/lib/firebase/blog.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getBlogPosts', () => {
    it('fetches published blog posts and sorts them newest first', async () => {
      const mockPosts = [
        {
          key: 'post-1',
          val: () => ({
            title: 'Ancien article',
            isPublished: true,
            publishedAt: '2026-01-10T10:00:00Z',
          }),
        },
        {
          key: 'post-2',
          val: () => ({
            title: 'Nouvel article',
            isPublished: true,
            publishedAt: '2026-02-15T10:00:00Z',
          }),
        },
        {
          key: 'post-draft',
          val: () => ({
            title: 'Brouillon',
            isPublished: false,
            publishedAt: '2026-02-20T10:00:00Z',
          }),
        },
      ];

      const snapshot = {
        exists: () => true,
        forEach: (cb: (item: any) => void) => mockPosts.forEach(cb),
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const posts = await getBlogPosts();
      expect(posts).toHaveLength(2); // Draft is filtered out
      expect(posts[0].id).toBe('post-2'); // Newest first
      expect(posts[1].id).toBe('post-1');
    });

    it('returns empty array when snapshot does not exist', async () => {
      const snapshot = { exists: () => false };
      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const posts = await getBlogPosts();
      expect(posts).toEqual([]);
    });

    it('returns empty array when error occurs', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(adminModule, 'getAdminDatabase').mockImplementation(() => {
        throw new Error('Database disconnected');
      });

      const posts = await getBlogPosts();
      expect(posts).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getBlogPostBySlug', () => {
    it('returns post if found and published', async () => {
      const mockPost = [
        {
          key: 'p-1',
          val: () => ({
            title: 'Maillots 2026',
            slug: 'maillots-2026',
            isPublished: true,
          }),
        },
      ];

      const snapshot = {
        exists: () => true,
        forEach: (cb: (item: any) => void) => mockPost.forEach(cb),
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const limitMock = vi.fn().mockReturnValue({ once: onceMock });
      const equalToMock = vi.fn().mockReturnValue({ limitToFirst: limitMock });
      const orderByChildMock = vi.fn().mockReturnValue({ equalTo: equalToMock });
      const refMock = vi.fn().mockReturnValue({ orderByChild: orderByChildMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const post = await getBlogPostBySlug('maillots-2026');
      expect(post).not.toBeNull();
      expect(post?.title).toBe('Maillots 2026');
    });

    it('returns null if post is not published or not found', async () => {
      const mockDraft = [
        {
          key: 'p-draft',
          val: () => ({
            title: 'Draft Post',
            slug: 'draft',
            isPublished: false,
          }),
        },
      ];

      const snapshot = {
        exists: () => true,
        forEach: (cb: (item: any) => void) => mockDraft.forEach(cb),
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const limitMock = vi.fn().mockReturnValue({ once: onceMock });
      const equalToMock = vi.fn().mockReturnValue({ limitToFirst: limitMock });
      const orderByChildMock = vi.fn().mockReturnValue({ equalTo: equalToMock });
      const refMock = vi.fn().mockReturnValue({ orderByChild: orderByChildMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const post = await getBlogPostBySlug('draft');
      expect(post).toBeNull();
    });
  });

  describe('getBlogPostById', () => {
    it('fetches single blog post by its database key', async () => {
      const snapshot = {
        exists: () => true,
        val: () => ({
          title: 'Article ID Test',
          slug: 'article-id-test',
        }),
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const post = await getBlogPostById('post-id-123');
      expect(post?.id).toBe('post-id-123');
      expect(post?.title).toBe('Article ID Test');
    });

    it('returns null if not found', async () => {
      const snapshot = { exists: () => false };
      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const post = await getBlogPostById('missing-post');
      expect(post).toBeNull();
    });
  });

  describe('createBlogPost', () => {
    it('creates and pushes a new blog post and revalidates cache', async () => {
      const setMock = vi.fn().mockResolvedValue(undefined);
      const pushMock = vi.fn().mockReturnValue({
        key: 'generated-key-1',
        set: setMock,
      });
      const refMock = vi.fn().mockReturnValue({ push: pushMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const newPost = await createBlogPost({
        title: 'Nouveau Départ',
        excerpt: 'Résumé',
        content: 'Contenu complet',
        coverImage: '/img.png',
        author: 'Nicolas',
        authorAvatar: '/avatar.png',
        publishedAt: '2026-03-01T00:00:00Z',
        category: 'Club',
        slug: 'nouveau-depart',
        isPublished: true,
      });

      expect(newPost.id).toBe('generated-key-1');
      expect(setMock).toHaveBeenCalled();
      expect(cacheModule.revalidatePath).toHaveBeenCalledWith('/blog');
    });
  });

  describe('updateBlogPost & deleteBlogPost', () => {
    it('updates post and revalidates post slug cache', async () => {
      const updateMock = vi.fn().mockResolvedValue(undefined);
      const snapshot = {
        exists: () => true,
        val: () => ({ slug: 'mon-article-modifie' }),
      };
      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({
        update: updateMock,
        once: onceMock,
      });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      await updateBlogPost('post-10', { title: 'Titre Modifié' });
      expect(updateMock).toHaveBeenCalledWith({ title: 'Titre Modifié' });
      expect(cacheModule.revalidatePath).toHaveBeenCalledWith('/blog/mon-article-modifie');
    });

    it('deletes post and revalidates blog cache', async () => {
      const removeMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ remove: removeMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      await deleteBlogPost('post-to-delete');
      expect(removeMock).toHaveBeenCalled();
      expect(cacheModule.revalidatePath).toHaveBeenCalledWith('/blog');
    });
  });

  describe('seedBlogPosts', () => {
    it('seeds array of posts sequentially', async () => {
      const setMock = vi.fn().mockResolvedValue(undefined);
      let callCount = 0;
      const pushMock = vi.fn().mockImplementation(() => {
        callCount++;
        return {
          key: `seed-id-${callCount}`,
          set: setMock,
        };
      });
      const refMock = vi.fn().mockReturnValue({ push: pushMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      await seedBlogPosts([
        { title: 'Post 1', slug: 'p1' } as any,
        { title: 'Post 2', slug: 'p2' } as any,
      ]);

      expect(pushMock).toHaveBeenCalledTimes(2);
      expect(setMock).toHaveBeenCalledTimes(2);
      expect(cacheModule.revalidatePath).toHaveBeenCalledWith('/blog');
    });
  });

  describe('revalidateBlogCache & revalidateBlogPostCache', () => {
    it('triggers cache revalidation on correct paths', async () => {
      await revalidateBlogCache();
      expect(cacheModule.revalidatePath).toHaveBeenCalledWith('/blog');

      await revalidateBlogPostCache('super-slug');
      expect(cacheModule.revalidatePath).toHaveBeenCalledWith('/blog/super-slug');
    });
  });
});
