import { NextResponse } from 'next/server';
import { getEquipment } from '@/app/lib/firebase/equipment';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const equipment = await getEquipment();
    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Error fetching public equipment:', error);
    return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 });
  }
}
