import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabase } from '@/app/lib/firebase/admin';
import { delegatedMemberChangeError, verifySectionRequest } from '@/app/lib/auth/admin-access';
import { isSessionAdmin } from '@/app/lib/auth/session';

/** Non-admins (members section): refusal for this change, read against the stored record. */
async function delegatedDenial(
  user: Parameters<typeof delegatedMemberChangeError>[0],
  id: string,
  changes: Record<string, unknown>
): Promise<NextResponse | null> {
  if (isSessionAdmin(user)) return null;
  const stored = (await getAdminDatabase().ref(`members/${id}`).once('value')).val();
  const denial = delegatedMemberChangeError(user, stored, changes);
  return denial ? NextResponse.json({ error: denial }, { status: 403 }) : null;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const authCheck = await verifySectionRequest(request, 'members');
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { id } = await context.params;
    const db = getAdminDatabase();
    const snapshot = await db.ref(`members/${id}`).once('value');

    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ id, ...snapshot.val() });
  } catch (error) {
    console.error('Error fetching member:', error);
    return NextResponse.json({ error: 'Failed to fetch member' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const authCheck = await verifySectionRequest(request, 'members');
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { id } = await context.params;
    const data = await request.json();
    const denied = await delegatedDenial(authCheck.user, id, data);
    if (denied) return denied;
    const db = getAdminDatabase();

    await db.ref(`members/${id}`).update({
      ...data,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const authCheck = await verifySectionRequest(request, 'members');
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { id } = await context.params;
    const denied = await delegatedDenial(authCheck.user, id, {});
    if (denied) return denied;
    const db = getAdminDatabase();

    await db.ref(`members/${id}`).remove();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}
