import React from 'react';
import type { Metadata } from 'next';
import { getPhotoAlbums } from '../lib/firebase/galleries';
import GalleryView from './GalleryView';
import { SheetHeader } from '../components/carte/SheetHeader';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Galerie & Chroniques Photos | CC Saint-Martin Blanmont',
  description:
    'Archives photographiques officielles du CC Saint-Martin Blanmont : albums et clichés retraçant les sorties, séjours ardennais et moments forts du club.',
};

export default async function GaleriePage(): Promise<React.ReactElement> {
  const albums = await getPhotoAlbums();
  const photoTotal = albums.reduce((sum, album) => sum + (album.photoCount || 0), 0);
  const seasons = new Set(albums.map((album) => album.year).filter(Boolean)).size;

  return (
    <main className="min-h-screen bg-paper transition-colors duration-200 dark:bg-night">
      <SheetHeader
        sheet="Archives photographiques"
        focus={{ x: 36, y: 40 }}
        title="Galerie & chroniques"
        description="La mémoire vive du peloton : les albums, les clichés et les saisons d'aventures cyclistes sur les routes brabançonnes, ardennaises et internationales."
        legend={[
          { term: 'Albums répertoriés', value: `${albums.length}` },
          { term: 'Clichés numérisés', value: photoTotal.toLocaleString('fr-BE') },
          { term: 'Saisons archivées', value: `${seasons} saisons` },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <GalleryView initialAlbums={albums} />
      </section>
    </main>
  );
}
