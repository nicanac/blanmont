import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifySectionRequest } from '@/app/lib/auth/admin-access';
import { getHeroSettings, updateHeroSettings } from '@/app/lib/firebase/hero';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authCheck = await verifySectionRequest(request, 'hero');
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const settings = await getHeroSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching hero settings:', error);
    return NextResponse.json({ error: 'Failed to fetch hero settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authCheck = await verifySectionRequest(request, 'hero');
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const data = await request.json();
    const updated = await updateHeroSettings(data);

    // Revalidate public home page and admin hero page caches
    revalidatePath('/');
    revalidatePath('/admin/hero');

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Error updating hero settings:', error);
    return NextResponse.json({ error: 'Failed to update hero settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  return POST(request);
}
