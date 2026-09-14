import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/app/lib/auth/session';
import { createPhotoAlbum, deletePhotoAlbum, getPhotoAlbums } from '@/app/lib/firebase/galleries';

export async function GET(): Promise<NextResponse> {
  try {
    const albums = await getPhotoAlbums();
    return NextResponse.json({ albums });
  } catch (error) {
    console.error('Error fetching albums:', error);
    return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authCheck = await verifyAdminRequest(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const data = await request.json();
    const { title, description, year, category, coverUrl, externalAlbumUrl, photoCount, featured } = data;

    if (!title || !coverUrl || !category) {
      return NextResponse.json(
        { error: 'Titre, URL de couverture et catégorie sont requis.' },
        { status: 400 }
      );
    }

    const newAlbum = await createPhotoAlbum({
      title,
      description: description || '',
      year: Number(year) || new Date().getFullYear(),
      category: category as 'Sorties' | 'Ardennes & Stages' | 'Événements' | 'Équipements',
      coverUrl,
      externalAlbumUrl: externalAlbumUrl || '',
      photoCount: Number(photoCount) || 1,
      featured: Boolean(featured),
    });

    return NextResponse.json({ success: true, album: newAlbum });
  } catch (error) {
    console.error('Error creating album:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de l’album.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const authCheck = await verifyAdminRequest(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Album ID requis' }, { status: 400 });
    }

    const success = await deletePhotoAlbum(id);
    if (!success) {
      return NextResponse.json({ error: 'Impossible de supprimer l’album' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting album:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
