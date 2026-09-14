import { PhotoAlbum } from '../../types';
import { isMockMode, getFirebaseDatabase, ref, get, set, snapshotToArray } from './client';
import { getAdminDatabase } from './admin';

const INITIAL_ALBUMS: PhotoAlbum[] = [
  {
    id: 'album-2026-rentree',
    title: 'Sortie de Rentrée · Saison 2026',
    description: 'Premier grand peloton groupé au départ de la Place de Blanmont, retrouvailles et nouveaux maillots Gobik.',
    year: 2026,
    category: 'Sorties',
    coverUrl: '/images/home-hero.jpg',
    externalAlbumUrl: 'https://photos.google.com',
    photoCount: 38,
    featured: true,
    createdAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'album-2025-ardennes',
    title: 'Weekend Ardennais · Houffalize & Bastogne',
    description: 'Deux journées de bosses intenses à travers la vallée de l\'Ourthe avec plus de 2 400 m de D+ pour les Groupes A et B.',
    year: 2025,
    category: 'Ardennes & Stages',
    coverUrl: '/images/IMG_5777.JPG',
    externalAlbumUrl: 'https://photos.google.com',
    photoCount: 64,
    featured: true,
    createdAt: '2025-06-15T18:30:00.000Z',
  },
  {
    id: 'album-2025-vtt-hiver',
    title: 'Rando Hivernale VTT & Chemins de Terre',
    description: 'Les sous-bois de Villers-la-Ville et les chemins creux de Chastre dans la boue et la bonne humeur.',
    year: 2025,
    category: 'Sorties',
    coverUrl: '/images/IMG_7627.JPG',
    externalAlbumUrl: 'https://photos.google.com',
    photoCount: 29,
    featured: false,
    createdAt: '2025-11-20T14:00:00.000Z',
  },
  {
    id: 'album-2025-souper',
    title: 'Souper Annuel & Remise du Carré Vert 2025',
    description: 'Soirée de clôture festive, remise du trophée de l\'assiduité et célébration des 47 ans du CC Saint-Martin.',
    year: 2025,
    category: 'Événements',
    coverUrl: '/images/IMG_8019.JPG',
    externalAlbumUrl: 'https://photos.google.com',
    photoCount: 52,
    featured: false,
    createdAt: '2025-12-05T21:00:00.000Z',
  },
  {
    id: 'album-2024-gobik',
    title: 'Shooting Tenues Officielles Gobik Custom',
    description: 'Présentation de la collection cuissards K10 et maillots manches courtes portée par les membres du comité.',
    year: 2024,
    category: 'Équipements',
    coverUrl: '/images/05ca4f92-29d6-43e0-9c6c-ee69d86ecd29.jpg',
    externalAlbumUrl: 'https://photos.google.com',
    photoCount: 22,
    featured: false,
    createdAt: '2024-04-12T16:00:00.000Z',
  },
];

export async function getPhotoAlbums(): Promise<PhotoAlbum[]> {
  if (isMockMode) {
    return [...INITIAL_ALBUMS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  try {
    const db = typeof window === 'undefined' ? getAdminDatabase() : getFirebaseDatabase();
    let snapshot;

    if (typeof window === 'undefined') {
      snapshot = await (db as any).ref('galleries').once('value');
    } else {
      snapshot = await get(ref(db as any, 'galleries'));
    }

    if (!snapshot.exists()) {
      // Seed initial albums if node is empty
      if (typeof window === 'undefined') {
        const seedMap = INITIAL_ALBUMS.reduce((acc, album) => {
          acc[album.id] = album;
          return acc;
        }, {} as Record<string, PhotoAlbum>);
        await (db as any).ref('galleries').set(seedMap);
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

  const db = typeof window === 'undefined' ? getAdminDatabase() : getFirebaseDatabase();
  if (typeof window === 'undefined') {
    await (db as any).ref(`galleries/${id}`).set(album);
  } else {
    await set(ref(db as any, `galleries/${id}`), album);
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
    const db = typeof window === 'undefined' ? getAdminDatabase() : getFirebaseDatabase();
    if (typeof window === 'undefined') {
      await (db as any).ref(`galleries/${id}`).remove();
    } else {
      await set(ref(db as any, `galleries/${id}`), null);
    }
    return true;
  } catch (error) {
    console.error('Failed to delete photo album:', error);
    return false;
  }
}
