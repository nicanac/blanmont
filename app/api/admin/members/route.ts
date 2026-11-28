import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabase } from '@/app/lib/firebase/admin';
import { delegatedMemberChangeError, verifySectionRequest } from '@/app/lib/auth/admin-access';
import { uniqueRoles } from '@/app/constants/roles';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authCheck = await verifySectionRequest(request, 'members');
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const data = await request.json();
    const denial = delegatedMemberChangeError(authCheck.user, { role: ['Member'] }, data);
    if (denial) {
      return NextResponse.json({ error: denial }, { status: 403 });
    }
    const db = getAdminDatabase();

    // Generate new member ID
    const membersRef = db.ref('members');
    const newMemberRef = membersRef.push();
    // Each role once (#262).
    const roles = uniqueRoles(data.role);

    const memberData = {
      name: data.name,
      email: data.email || null,
      bio: data.bio || '',
      photoUrl: data.photoUrl || '/images/default-avatar.png',
      role: roles.length > 0 ? roles : ['Member'],
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
