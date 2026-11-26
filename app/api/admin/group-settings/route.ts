import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { verifySectionRequest } from '@/app/lib/auth/admin-access';
import { GROUP_SETTINGS_CACHE_TAG } from '@/app/constants/groups';
import {
  getGroupSettings,
  getGroupUsage,
  updateGroupSettings,
} from '@/app/lib/firebase/group-settings';
import { GroupSettingsSchema, safeValidate } from '@/app/lib/validation';

/**
 * GET: current group naming settings plus how often each stored code is used.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authCheck = await verifySectionRequest(request, 'groupes');
  if (!authCheck.authorized) return authCheck.response;

  try {
    const [settings, usage] = await Promise.all([getGroupSettings(), getGroupUsage()]);
    return NextResponse.json({ settings, usage });
  } catch (error) {
    console.error('Error fetching group settings:', error);
    return NextResponse.json({ error: 'Impossible de charger les groupes' }, { status: 500 });
  }
}

/**
 * PUT: replaces the group naming settings. Stored codes on members/attendance are untouched.
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const authCheck = await verifySectionRequest(request, 'groupes');
  if (!authCheck.authorized) return authCheck.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }

  const validation = safeValidate(GroupSettingsSchema, body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.errors.map((e) => e.message).join(' · '), errors: validation.errors },
      { status: 400 }
    );
  }

  try {
    const settings = await updateGroupSettings(validation.data);
    // Expire the cached settings now and re-render every page (labels live in the root layout).
    revalidateTag(GROUP_SETTINGS_CACHE_TAG, { expire: 0 });
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating group settings:', error);
    return NextResponse.json({ error: "Impossible d'enregistrer les groupes" }, { status: 500 });
  }
}
