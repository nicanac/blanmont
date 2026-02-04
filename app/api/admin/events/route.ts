import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabase } from '@/app/lib/firebase/admin';
import { CalendarEvent } from '@/app/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await request.json();
    const db = getAdminDatabase();

    const eventsRef = db.ref('calendar-events');
    const newEventRef = eventsRef.push();

    const eventData: Omit<CalendarEvent, 'id'> = {
      isoDate: data.isoDate,
      location: data.location || '',
      distances: data.distances || '',
      departure: data.departure || '',
      address: data.address || '',
      remarks: data.remarks || '',
      alternative: data.alternative || '',
      group: data.group || 'Blanmont',
    };

    await newEventRef.set({
      ...eventData,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: newEventRef.key });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
