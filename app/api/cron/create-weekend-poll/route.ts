import { NextResponse } from 'next/server';
import { autoCreateUpcomingWeekendPoll } from '@/app/lib/sondage-automation';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  // Optional authorization check: Vercel Cron sends Bearer token with CRON_SECRET
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await autoCreateUpcomingWeekendPoll();
    const statusCode = result.success ? 200 : 500;
    return NextResponse.json(
      {
        ...result,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('API Cron create-weekend-poll failed:', error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  return GET(request);
}
