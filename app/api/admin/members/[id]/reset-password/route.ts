import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/app/lib/firebase/admin';
import { getAdminDatabase } from '@/app/lib/firebase/admin';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const { password } = await request.json();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Get member's authUid from database
    const db = getAdminDatabase();
    const memberSnapshot = await db.ref(`members/${id}`).once('value');

    if (!memberSnapshot.exists()) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const member = memberSnapshot.val();
    const authUid = member.authUid;

    if (!authUid) {
      // If no authUid, this member doesn't have Firebase Auth account
      return NextResponse.json(
        { error: "Ce membre n'a pas de compte authentifié" },
        { status: 400 }
      );
    }

    // Update password using Firebase Admin Auth
    const auth = getAdminAuth();
    await auth.updateUser(authUid, { password });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
