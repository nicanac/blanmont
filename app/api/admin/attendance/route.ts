import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabase } from '@/app/lib/firebase/admin';

/**
 * GET /api/admin/attendance?eventId=xxx
 * Fetch attendance for a specific event, or all attendance if no eventId.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const db = getAdminDatabase();

    if (eventId) {
      const snapshot = await db.ref(`attendance/${eventId}`).once('value');
      if (!snapshot.exists()) {
        return NextResponse.json({ members: {} });
      }
      return NextResponse.json({ eventId, ...snapshot.val() });
    }

    // Return all attendance
    const snapshot = await db.ref('attendance').once('value');
    if (!snapshot.exists()) {
      return NextResponse.json({});
    }
    return NextResponse.json(snapshot.val());
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

/**
 * POST /api/admin/attendance
 * Body: { eventId, isoDate, memberId, name, group, action: 'add' | 'remove' }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await request.json();
    const { eventId, isoDate, memberId, name, group, action } = data;

    if (!eventId || !memberId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: eventId, memberId, action' },
        { status: 400 }
      );
    }

    const db = getAdminDatabase();

    if (action === 'add') {
      if (!isoDate || !name) {
        return NextResponse.json(
          { error: 'Missing required fields for add: isoDate, name' },
          { status: 400 }
        );
      }

      // Set the isoDate on the attendance record
      await db.ref(`attendance/${eventId}/isoDate`).set(isoDate);

      // Add the member
      await db.ref(`attendance/${eventId}/members/${memberId}`).set({
        memberId,
        name,
        group: group || '',
        markedAt: new Date().toISOString(),
      });

      await db.ref(`attendance/${eventId}/updatedAt`).set(new Date().toISOString());

      return NextResponse.json({ success: true });
    }

    if (action === 'remove') {
      await db.ref(`attendance/${eventId}/members/${memberId}`).remove();
      await db.ref(`attendance/${eventId}/updatedAt`).set(new Date().toISOString());

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action. Use "add" or "remove".' }, { status: 400 });
  } catch (error) {
    console.error('Error updating attendance:', error);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}
