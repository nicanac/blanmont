import { NextRequest, NextResponse } from 'next/server';
import { createTraceWithGPX } from '@/app/lib/notion/traces';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
        name, date, distance, elevation, 
        direction, start, end,
        komootLink, gpxLink, photoLink,
        roadQuality, rating, status, note,
        gpxContent
    } = body;

    if (!name || !date) {
        return NextResponse.json({ error: 'Name and Date are required' }, { status: 400 });
    }

    const result = await createTraceWithGPX({
        name,
        date,
        distance,
        elevation,
        direction,
        start,
        end,
        komootLink,
        gpxLink,
        photoLink,
        roadQuality,
        rating,
        status,
        note
    }, gpxContent);

    if (!result.success) {
        return NextResponse.json({ error: result.error || 'Failed to create trace' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (error: any) {
    console.error('Error creating trace:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
