import React from 'react';
import type { Metadata } from 'next';
import { getPhotoAlbums } from '../lib/firebase/galleries';
import GalleryView from './GalleryView';
import { PageHero } from '../components/ui/PageHero';
import { CameraIcon } from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Galerie & Chroniques Photos',
  description:
    'Revivez en images les sorties dominicales, les séjours ardennais et les moments conviviaux du CC Saint-Martin Blanmont.',
};

export default async function GaleriePage(): Promise<React.ReactElement> {
  const albums = await getPhotoAlbums();

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <PageHero
        title={
          <>
            Galerie &amp; <span className="text-[#e03e3e] italic">Chroniques</span>
          </>
        }
        description="L'histoire du club en images : nos sorties dominicales au départ de Blanmont, nos stages en montagne et nos rituels d'équipe."
        badge="Mémoire du Peloton"
        badgeIcon={<CameraIcon className="h-4 w-4" />}
        variant="red"
        size="md"
        watermark="PHOTOS"
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <GalleryView initialAlbums={albums} />
      </div>
    </main>
  );
}
