import { NextRequest, NextResponse } from 'next/server';
import { deleteEquipment, updateEquipment, getEquipmentById } from '@/app/lib/firebase/equipment';

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(
    request: NextRequest,
    context: RouteContext
): Promise<NextResponse> {
    try {
        const { id } = await context.params;
        const item = await getEquipmentById(id);

        if (!item) {
            return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
        }

        return NextResponse.json(item);
    } catch (error) {
        console.error('Error fetching equipment:', error);
        return NextResponse.json(
            { error: 'Failed to fetch equipment' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    context: RouteContext
): Promise<NextResponse> {
    try {
        const { id } = await context.params;
        await deleteEquipment(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting equipment:', error);
        return NextResponse.json(
            { error: 'Failed to delete equipment' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    context: RouteContext
): Promise<NextResponse> {
    try {
        const { id } = await context.params;
        const data = await request.json();
        await updateEquipment(id, data);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating equipment:', error);
        return NextResponse.json(
            { error: 'Failed to update equipment' },
            { status: 500 }
        );
    }
}
