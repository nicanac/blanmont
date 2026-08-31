import { NextRequest, NextResponse } from 'next/server';
import { getEquipment, createEquipment } from '@/app/lib/firebase/equipment';
import { verifyAdminRequest } from '@/app/lib/auth/session';

export async function GET(request: NextRequest) {
    const authCheck = await verifyAdminRequest(request);
    if (!authCheck.authorized) {
        return authCheck.response;
    }

    try {
        const equipment = await getEquipment();
        return NextResponse.json(equipment);
    } catch (error) {
        console.error('Error fetching equipment:', error);
        return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const authCheck = await verifyAdminRequest(request);
    if (!authCheck.authorized) {
        return authCheck.response;
    }

    try {
        const data = await request.json();
        const newEquipment = await createEquipment(data);
        return NextResponse.json(newEquipment);
    } catch (error) {
        console.error('Error creating equipment:', error);
        return NextResponse.json({ error: 'Failed to create equipment' }, { status: 500 });
    }
}
