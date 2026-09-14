import React from 'react';
import { getPhotoAlbums } from '@/app/lib/firebase/galleries';
import AdminGalerieClient from './AdminGalerieClient';

export const dynamic = 'force-dynamic';

export default async function AdminGaleriePage(): Promise<React.ReactElement> {
  const albums = await getPhotoAlbums();

  return (
    <div className="space-y-6">
      <AdminGalerieClient initialAlbums={albums} />
    </div>
  );
}
