import { describe, it, expect } from 'vitest';
import {
  getPhotoAlbums,
  getPhotoAlbumById,
  createPhotoAlbum,
  deletePhotoAlbum,
} from '@/app/lib/firebase/galleries';
import type { PhotoAlbum } from '@/app/types';

describe('Photo Galleries & Chronicles Data Layer', () => {
  it('retrieves the migrated albums archive in mock mode', async () => {
    const albums = await getPhotoAlbums();
    expect(albums).toBeDefined();
    expect(albums.length).toBe(149);

    // Verify chronological order (createdAt descending)
    for (let i = 0; i < albums.length - 1; i++) {
      expect(albums[i].createdAt >= albums[i + 1].createdAt).toBe(true);
    }
  });

  it('validates album schema and fields integrity', async () => {
    const albums = await getPhotoAlbums();
    const validCategories = new Set([
      'Sorties',
      'Ardennes & Stages',
      'Événements',
      'Équipements',
    ]);

    for (const album of albums) {
      expect(album.id).toBeTruthy();
      expect(album.title).toBeTruthy();
      expect(album.year).toBeGreaterThanOrEqual(2022);
      expect(album.year).toBeLessThanOrEqual(2026);
      expect(validCategories.has(album.category)).toBe(true);
      expect(album.coverUrl).toMatch(/^https?:\/\//);
      expect(album.photoCount).toBeGreaterThan(0);
      expect(Array.isArray(album.images)).toBe(true);
      expect(album.images?.length).toBe(album.photoCount);
    }
  });

  it('contains historical seasons from 2022 through 2026', async () => {
    const albums = await getPhotoAlbums();
    const years = new Set(albums.map((a) => a.year));

    expect(years.has(2026)).toBe(true);
    expect(years.has(2025)).toBe(true);
    expect(years.has(2024)).toBe(true);
    expect(years.has(2023)).toBe(true);
    expect(years.has(2022)).toBe(true);
  });

  it('fetches an album by ID correctly', async () => {
    const albums = await getPhotoAlbums();
    const first = albums[0];

    const found = await getPhotoAlbumById(first.id);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(first.id);
    expect(found?.title).toBe(first.title);

    const notFound = await getPhotoAlbumById('non-existent-album-id');
    expect(notFound).toBeNull();
  });

  it('creates and deletes an album in mock mode', async () => {
    const newAlbumData: Omit<PhotoAlbum, 'id' | 'createdAt'> = {
      title: 'Sortie Test Vitest',
      description: 'Chronique de test unitaire',
      year: 2026,
      category: 'Sorties',
      coverUrl: 'https://lh3.googleusercontent.com/pw/test-cover',
      externalAlbumUrl: 'https://photos.app.goo.gl/test',
      photoCount: 5,
      featured: false,
      images: ['https://lh3.googleusercontent.com/pw/test-cover'],
    };

    const created = await createPhotoAlbum(newAlbumData);
    expect(created.id).toMatch(/^album_/);
    expect(created.title).toBe('Sortie Test Vitest');
    expect(created.createdAt).toBeDefined();

    const fetched = await getPhotoAlbumById(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.title).toBe('Sortie Test Vitest');

    const deleted = await deletePhotoAlbum(created.id);
    expect(deleted).toBe(true);

    const afterDelete = await getPhotoAlbumById(created.id);
    expect(afterDelete).toBeNull();
  });
});
