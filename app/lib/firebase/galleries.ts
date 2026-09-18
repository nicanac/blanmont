import { PhotoAlbum } from '../../types';
import { isMockMode, getFirebaseDatabase, ref, get, set, snapshotToArray } from './client';
import migratedAlbumsData from '../../data/migrated-albums.json';

const INITIAL_ALBUMS: PhotoAlbum[] = migratedAlbumsData as PhotoAlbum[];

export async function getPhotoAlbums(): Promise<PhotoAlbum[]> {
  if (isMockMode) {
    return [...INITIAL_ALBUMS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  try {
    let snapshot;

    if (typeof window === 'undefined') {
      const { getAdminDatabase } = await import('./admin');
      const db = getAdminDatabase();
      snapshot = await db.ref('galleries').once('value');
    } else {
      const db = getFirebaseDatabase();
      snapshot = await get(ref(db, 'galleries'));
    }

    if (!snapshot.exists()) {
      // Seed initial albums if node is empty
      if (typeof window === 'undefined') {
        const { getAdminDatabase } = await import('./admin');
        const db = getAdminDatabase();
        const seedMap = INITIAL_ALBUMS.reduce((acc, album) => {
          acc[album.id] = album;
          return acc;
        }, {} as Record<string, PhotoAlbum>);
        await db.ref('galleries').set(seedMap);
      }
      return INITIAL_ALBUMS;
    }

    const albums = snapshotToArray<PhotoAlbum>(snapshot);
    return albums.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    console.error('Failed to fetch photo albums:', error);
    return INITIAL_ALBUMS;
  }
}

export async function getPhotoAlbumById(id: string): Promise<PhotoAlbum | null> {
  if (isMockMode) {
    return INITIAL_ALBUMS.find((a) => a.id === id) || null;
  }

  try {
    let snapshot;

    if (typeof window === 'undefined') {
      const { getAdminDatabase } = await import('./admin');
      const db = getAdminDatabase();
      snapshot = await db.ref(`galleries/${id}`).once('value');
    } else {
      const db = getFirebaseDatabase();
      snapshot = await get(ref(db, `galleries/${id}`));
    }

    if (snapshot.exists()) {
      return snapshot.val() as PhotoAlbum;
    }

    return INITIAL_ALBUMS.find((a) => a.id === id) || null;
  } catch (error) {
    console.error(`Failed to fetch photo album ${id}:`, error);
    return INITIAL_ALBUMS.find((a) => a.id === id) || null;
  }
}

export async function createPhotoAlbum(data: Omit<PhotoAlbum, 'id' | 'createdAt'>): Promise<PhotoAlbum> {
  const id = `album_${Date.now()}`;
  const album: PhotoAlbum = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };

  if (isMockMode) {
    INITIAL_ALBUMS.unshift(album);
    return album;
  }

  if (typeof window === 'undefined') {
    const { getAdminDatabase } = await import('./admin');
    const db = getAdminDatabase();
    await db.ref(`galleries/${id}`).set(album);
  } else {
    const db = getFirebaseDatabase();
    await set(ref(db, `galleries/${id}`), album);
  }

  return album;
}

export async function deletePhotoAlbum(id: string): Promise<boolean> {
  if (isMockMode) {
    const idx = INITIAL_ALBUMS.findIndex((a) => a.id === id);
    if (idx >= 0) INITIAL_ALBUMS.splice(idx, 1);
    return true;
  }

  try {
    if (typeof window === 'undefined') {
      const { getAdminDatabase } = await import('./admin');
      const db = getAdminDatabase();
      await db.ref(`galleries/${id}`).remove();
    } else {
      const db = getFirebaseDatabase();
      await set(ref(db, `galleries/${id}`), null);
    }
    return true;
  } catch (error) {
    console.error('Failed to delete photo album:', error);
    return false;
  }
}
