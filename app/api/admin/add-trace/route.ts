import { NextRequest, NextResponse } from 'next/server';
import { createTraceWithGPX } from '@/app/lib/notion/traces';
import { AddTraceApiSchema, safeValidate } from '@/app/lib/validation';
import { logger } from '@/app/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const validation = safeValidate(AddTraceApiSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const { 
        name, date, distance, elevation, 
        direction, start, end,
        komootLink, gpxLink, photoLink,
        roadQuality, rating, status, note,
        gpxContent
    } = validation.data;

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
    logger.error('Error creating trace:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
