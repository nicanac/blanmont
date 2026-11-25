import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getAdminDatabase, isAdminConfigured } from '@/app/lib/firebase/admin';
import { verifyCronRequest } from '@/app/lib/auth/cron';

/**
 * Daily cron: fills the elevation (m D+) of traces that have a Komoot link but no elevation yet,
 * by reading `elevation_up` from the public Komoot tour page.
 * Source of truth is Firebase RTDB `/traces` (this job used to target the legacy Notion database).
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Traces processed per run, to stay inside the function time budget and be polite to Komoot. */
export const ELEVATION_BATCH_SIZE = 20;
const KOMOOT_DELAY_MS = 600;
const KOMOOT_TIMEOUT_MS = 10_000;

interface TraceElevationRecord {
  mapUrl?: string | null;
  elevation?: number | string | null;
}

/** Komoot tour URLs only (www.komoot.com / komoot.fr / komoot.de …). */
export function isKomootUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value) return false;
  try {
    const { protocol, hostname } = new URL(value);
    return protocol === 'https:' && /(^|\.)komoot\.[a-z]+$/.test(hostname);
  } catch {
    return false;
  }
}

/** True when the trace has no usable elevation (missing, null, 0 or not a number). */
export function needsElevation(elevation: TraceElevationRecord['elevation']): boolean {
  const n = typeof elevation === 'string' ? Number(elevation) : elevation;
  return typeof n !== 'number' || !Number.isFinite(n) || n <= 0;
}

/** Extracts the positive elevation gain from a Komoot tour page, rounded to metres. */
export function extractElevation(html: string): number | null {
  const match =
    html.match(/\\"elevation_up\\":([\d.]+)/) ?? html.match(/"elevation_up":([\d.]+)/);
  if (!match) return null;
  const value = Math.round(parseFloat(match[1]));
  return Number.isFinite(value) && value > 0 ? value : null;
}

async function fetchKomootHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BlanmontClubBot/1.0)' },
    signal: AbortSignal.timeout(KOMOOT_TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`Komoot responded ${response.status}`);
  }
  return response.text();
}

export async function GET(request: Request): Promise<NextResponse> {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  if (!isAdminConfigured()) {
    return NextResponse.json({ error: 'Firebase Admin is not configured' }, { status: 500 });
  }

  try {
    const db = getAdminDatabase();
    const snapshot = await db.ref('traces').once('value');
    const traces = (snapshot.val() ?? {}) as Record<string, TraceElevationRecord>;

    const candidates = Object.entries(traces).filter(
      ([, trace]) => isKomootUrl(trace?.mapUrl) && needsElevation(trace?.elevation)
    );
    const batch = candidates.slice(0, ELEVATION_BATCH_SIZE);

    let updated = 0;
    let failed = 0;
    for (const [id, trace] of batch) {
      try {
        await new Promise((resolve) => setTimeout(resolve, KOMOOT_DELAY_MS));
        const elevation = extractElevation(await fetchKomootHtml(trace.mapUrl as string));
        if (elevation === null) {
          failed++;
          continue;
        }
        await db.ref(`traces/${id}`).update({ elevation, updatedAt: new Date().toISOString() });
        updated++;
      } catch (error) {
        console.error(`[sync-elevation] trace ${id} failed:`, error);
        failed++;
      }
    }

    if (updated > 0) {
      revalidateTag('traces', { expire: 0 });
      revalidatePath('/traces');
    }

    return NextResponse.json({
      success: true,
      total: Object.keys(traces).length,
      missing: candidates.length,
      processed: batch.length,
      updated,
      failed,
      remaining: candidates.length - updated,
    });
  } catch (error: unknown) {
    console.error('[sync-elevation] cron failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
