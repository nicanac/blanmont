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
      cotisation2026Status: data.cotisation2026Status || 'pending',
      cotisation2026PaidAt: data.cotisation2026PaidAt || null,
      ffbcLicenseNumber: data.ffbcLicenseNumber || null,
      iceContactName: data.iceContactName || null,
      iceContactPhone: data.iceContactPhone || null,
      iceRelationship: data.iceRelationship || null,
      preferredGroup: data.preferredGroup || 'B',
      createdAt: new Date().toISOString(),
    };

    await newMemberRef.set(memberData);

    return NextResponse.json({ success: true, id: newMemberRef.key });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}
