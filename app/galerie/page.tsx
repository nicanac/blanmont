import React from 'react';
import type { Metadata } from 'next';
import { getPhotoAlbums } from '../lib/firebase/galleries';
import GalleryView from './GalleryView';
import { PageHero } from '../components/ui/PageHero';
import { CameraIcon } from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Galerie & Chroniques Photos | CC Saint-Martin Blanmont',
  description:
    'Archives photographiques officielles du CC Saint-Martin Blanmont : 149 albums et plus de 3 870 clichés retraçant les sorties, séjours ardennais et moments forts du club de 2022 à 2026.',
};

export default async function GaleriePage(): Promise<React.ReactElement> {
  const albums = await getPhotoAlbums();

  return (
    <main className="min-h-screen bg-[#faf8f5] dark:bg-[#0a0c10] transition-colors duration-200">
      <PageHero
        title={
          <>
            Galerie &amp; <span className="text-[#e03e3e] italic">Chroniques</span>
          </>
        }
        description="La mémoire vive du peloton : 149 albums, plus de 3 870 clichés et 5 saisons d'aventures cyclistes sur les routes brabançonnes, ardennaises et internationales."
        badge="Archives Officielles"
        badgeIcon={<CameraIcon className="h-4 w-4" />}
        variant="red"
        size="md"
        watermark="PHOTOS"
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <GalleryView initialAlbums={albums} />
      </div>
    </main>
  );
}
