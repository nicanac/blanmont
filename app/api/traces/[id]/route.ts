import { NextRequest, NextResponse } from 'next/server';
import { getTrace, updateTrace, deleteTrace } from '@/app/lib/firebase';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const trace = await getTrace(resolvedParams.id);

    if (!trace) {
      return NextResponse.json({ error: 'Trace not found' }, { status: 404 });
    }

    return NextResponse.json(trace);
  } catch (error) {
    console.error('Failed to fetch trace:', error);
    return NextResponse.json({ error: 'Failed to fetch trace' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await request.json();

    const result = await updateTrace(resolvedParams.id, {
      name: body.name,
      distance: body.distance,
      elevation: body.elevation,
      direction: body.direction,
      surface: body.surface,
      rating: body.rating,
      description: body.description,
      mapUrl: body.mapUrl,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update trace:', error);
    return NextResponse.json({ error: 'Failed to update trace' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const result = await deleteTrace(resolvedParams.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete trace:', error);
    return NextResponse.json({ error: 'Failed to delete trace' }, { status: 500 });
  }
}
