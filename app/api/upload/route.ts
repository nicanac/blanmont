import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest } from '@/app/lib/auth/session';
import { uploadImageToCloudinary, isCloudinaryConfigured } from '@/app/lib/cloudinary';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getSessionUserFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { error: 'Non authentifié. Veuillez vous connecter.' },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;

    if (!file || !path) {
      return NextResponse.json(
        { error: 'Missing file or path' },
        { status: 400 }
      );
    }

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: 'Cloudinary not configured' },
        { status: 500 }
      );
    }

    // Extract folder and filename from path
    // Path format: "blog/uploads/2026-02-06-filename.jpg"
    const pathParts = path.split('/');
    const filename = pathParts.pop()?.replace(/\.[^/.]+$/, '') || 'upload'; // Remove extension
    const folder = pathParts.join('/') || 'blog';

    const result = await uploadImageToCloudinary(file, {
      folder,
      publicId: filename,
    });

    return NextResponse.json({ 
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: unknown) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
