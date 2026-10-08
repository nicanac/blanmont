import { NextRequest, NextResponse } from 'next/server';
import {
  safeValidate,
  ActivityClientLogSchema,
  ActivityLogFilterSchema,
  ActivityReviewUpdateSchema,
  ActivityBatchReviewSchema,
} from '@/app/lib/validation';
import {
  recordActivity,
  getActivityLogs,
  getActivityStats,
  pruneActivityLogs,
  updateLogReview,
  batchUpdateLogReviews,
} from '@/app/lib/logging/activityLogger';
import { extractClientIp } from '@/app/lib/logging/ipAnonymizer';
import { parseDeviceType } from '@/app/lib/logging/visitorSession';
import { getSessionUserFromRequest, verifyAdminRequest } from '@/app/lib/auth/session';

/**
 * POST /api/logs
 * Ingestion endpoint for client telemetry, navigation views, and user interactions.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const rawBody = await request.json().catch(() => ({}));
    const validation = safeValidate(ActivityClientLogSchema, rawBody);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    const clientIp = extractClientIp(request.headers);
    const userAgent = request.headers.get('user-agent') || undefined;
    const deviceType = parseDeviceType(userAgent);

    // Check if client is an authenticated session user
    const session = await getSessionUserFromRequest(request);

    const logId = await recordActivity({
      category: data.category,
      action: data.action,
      title: data.title,
      severity: data.severity,
      user: {
        isAuthenticated: Boolean(session),
        userId: session?.id || null,
        userName: session?.name || (session ? 'Membre' : 'Visiteur anonyme'),
        userEmail: session?.email || null,
        role: session?.role || (session ? ['Member'] : ['Guest']),
        visitorId: data.visitorId,
      },
      context: {
        path: data.path || '/',
        referrer: data.referrer,
        userAgent,
        deviceType,
        ip: clientIp,
      },
      metadata: data.metadata,
    });

    return NextResponse.json({ success: true, id: logId }, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/logs POST] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error recording activity' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/logs
 * Protected endpoint for admins to query activity logs and statistics.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const adminCheck = await verifyAdminRequest(request);
  if (!adminCheck.authorized) {
    return adminCheck.response;
  }

  try {
    const { searchParams } = new URL(request.url);

    // If stats=true is requested, return aggregated stats
    if (searchParams.get('stats') === 'true') {
      const yearMonth = searchParams.get('yearMonth') || undefined;
      const stats = await getActivityStats(yearMonth);
      return NextResponse.json({ stats });
    }

    const filterInput = {
      yearMonth: searchParams.get('yearMonth') || undefined,
      category: (searchParams.get('category') as any) || undefined,
      severity: (searchParams.get('severity') as any) || undefined,
      userType: (searchParams.get('userType') as any) || undefined,
      reviewStatus: (searchParams.get('reviewStatus') as any) || undefined,
      searchQuery: searchParams.get('q') || undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    };

    const validation = safeValidate(ActivityLogFilterSchema, filterInput);
    if (!validation.success) {
      return NextResponse.json({ error: 'Filtres invalides', details: validation.errors }, { status: 400 });
    }

    const logs = await getActivityLogs(validation.data);
    return NextResponse.json({ logs, count: logs.length });
  } catch (error: any) {
    console.error('[API /api/logs GET] Error:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des logs' }, { status: 500 });
  }
}

/**
 * PATCH /api/logs
 * Protected endpoint for admins to triage and moderate logs (single or batch).
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const adminCheck = await verifyAdminRequest(request);
  if (!adminCheck.authorized) {
    return adminCheck.response;
  }

  try {
    const rawBody = await request.json().catch(() => ({}));
    const adminSession = adminCheck.user;
    const reviewerName = adminSession?.name || adminSession?.email || 'Administrateur';
    const reviewedAt = new Date().toISOString();

    // Check if batch update
    if (Array.isArray(rawBody.logIds)) {
      const batchValidation = safeValidate(ActivityBatchReviewSchema, rawBody);
      if (!batchValidation.success) {
        return NextResponse.json(
          { error: 'Données de modération par lot invalides', details: batchValidation.errors },
          { status: 400 }
        );
      }

      const { logIds, status, notes, yearMonth } = batchValidation.data;
      const result = await batchUpdateLogReviews(
        logIds,
        {
          status,
          notes: notes || null,
          reviewedBy: reviewerName,
          reviewedAt,
        },
        yearMonth
      );

      return NextResponse.json({
        success: true,
        message: `${result.updatedCount} entrée(s) mise(s) à jour avec succès.`,
        updatedCount: result.updatedCount,
      });
    }

    // Single update
    const singleValidation = safeValidate(ActivityReviewUpdateSchema, rawBody);
    if (!singleValidation.success) {
      return NextResponse.json(
        { error: 'Données de modération invalides', details: singleValidation.errors },
        { status: 400 }
      );
    }

    const { logId, status, notes, yearMonth } = singleValidation.data;
    const success = await updateLogReview(
      logId,
      {
        status,
        notes: notes || null,
        reviewedBy: reviewerName,
        reviewedAt,
      },
      yearMonth
    );

    if (!success) {
      return NextResponse.json({ error: 'Événement introuvable pour mise à jour' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Statut de modération mis à jour.',
      review: {
        status,
        notes: notes || null,
        reviewedBy: reviewerName,
        reviewedAt,
      },
    });
  } catch (error: any) {
    console.error('[API /api/logs PATCH] Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modération de la journalisation' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/logs
 * Protected endpoint to prune logs older than specified days (default 90 days).
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const adminCheck = await verifyAdminRequest(request);
  if (!adminCheck.authorized) {
    return adminCheck.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days') ? Number(searchParams.get('days')) : 90;

    const result = await pruneActivityLogs(days);
    return NextResponse.json({
      success: true,
      message: `Nettoyage terminé : ${result.deletedCount} logs purgés (> ${days} jours).`,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error('[API /api/logs DELETE] Error:', error);
    return NextResponse.json({ error: 'Erreur lors de la purge des logs' }, { status: 500 });
  }
}
