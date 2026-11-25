import { NextResponse } from 'next/server';
import { gzipSync } from 'node:zlib';
import { getStorage } from 'firebase-admin/storage';
import { getAdminApp, getAdminDatabase, isAdminConfigured } from '@/app/lib/firebase/admin';
import { verifyCronRequest } from '@/app/lib/auth/cron';

/**
 * Daily cron: exports the whole Realtime Database as gzipped JSON to the project's
 * Firebase Storage bucket at `backups/rtdb-YYYY-MM-DD.json.gz`, then deletes backups
 * older than BACKUP_RETENTION_DAYS.
 *
 * The `backups/` path matches no rule in storage.rules, so clients can neither read
 * nor write it; only the Admin SDK (service account) can.
 *
 * Restore: download the file, gunzip, then `firebase database:set / rtdb-YYYY-MM-DD.json`
 * (or import a single node with `database:set /<node>`).
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export const BACKUP_PREFIX = 'backups/rtdb-';
export const BACKUP_RETENTION_DAYS = 30;

/** `backups/rtdb-2026-11-25.json.gz` for the given date (UTC). */
export function backupFileName(date: Date): string {
  return `${BACKUP_PREFIX}${date.toISOString().slice(0, 10)}.json.gz`;
}

/** Backup file names strictly older than `retentionDays` before `now` (UTC dates). */
export function expiredBackups(names: string[], now: Date, retentionDays = BACKUP_RETENTION_DAYS): string[] {
  const cutoff = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  cutoff.setUTCDate(cutoff.getUTCDate() - retentionDays);
  return names.filter((name) => {
    const match = name.match(/^backups\/rtdb-(\d{4})-(\d{2})-(\d{2})\.json\.gz$/);
    if (!match) return false;
    const fileDate = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return fileDate < cutoff.getTime();
  });
}

export async function GET(request: Request): Promise<NextResponse> {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  if (!isAdminConfigured()) {
    return NextResponse.json({ error: 'Firebase Admin is not configured' }, { status: 500 });
  }

  try {
    const now = new Date();
    const snapshot = await getAdminDatabase().ref('/').once('value');
    const json = JSON.stringify(snapshot.val() ?? {});
    const gzipped = gzipSync(Buffer.from(json, 'utf8'));

    const bucket = getStorage(getAdminApp()).bucket();
    const fileName = backupFileName(now);
    await bucket.file(fileName).save(gzipped, {
      resumable: false,
      contentType: 'application/gzip',
      metadata: { cacheControl: 'private, no-store' },
    });

    const [files] = await bucket.getFiles({ prefix: BACKUP_PREFIX });
    const toDelete = expiredBackups(
      files.map((f) => f.name),
      now
    );
    await Promise.all(toDelete.map((name) => bucket.file(name).delete({ ignoreNotFound: true })));

    return NextResponse.json({
      success: true,
      file: fileName,
      bytes: gzipped.byteLength,
      rawBytes: Buffer.byteLength(json, 'utf8'),
      deleted: toDelete,
      timestamp: now.toISOString(),
    });
  } catch (error: unknown) {
    console.error('[backup-db] cron failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
