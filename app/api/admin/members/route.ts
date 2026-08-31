import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabase } from '@/app/lib/firebase/admin';
import { verifyAdminRequest } from '@/app/lib/auth/session';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authCheck = await verifyAdminRequest(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const data = await request.json();
    const db = getAdminDatabase();

    // Generate new member ID
    const membersRef = db.ref('members');
    const newMemberRef = membersRef.push();

    const memberData = {
      name: data.name,
      email: data.email || null,
      bio: data.bio || '',
      photoUrl: data.photoUrl || '/images/default-avatar.png',
      role: data.role || ['Member'],
      stravaId: data.stravaId || null,
      createdAt: new Date().toISOString(),
    };

    await newMemberRef.set(memberData);

    return NextResponse.json({ success: true, id: newMemberRef.key });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}
