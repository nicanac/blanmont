import { getAdminDatabase } from '../firebase/admin';
import { isMockMode, snapshotToArray } from '../firebase/client';
import {
  ActivityLog,
  ActivityLogFilter,
  ActivityStats,
  LogCategory,
  LogSeverity,
} from '@/app/types/logging';
import { anonymizeIp } from './ipAnonymizer';

// In-memory mock store for tests / local development without Firebase credentials
const mockLogStore: Map<string, ActivityLog> = new Map();

export interface RecordActivityInput {
  category: LogCategory;
  action: string;
  title: string;
  severity?: LogSeverity;
  user?: Partial<ActivityLog['user']>;
  context?: Partial<ActivityLog['context']>;
  metadata?: Record<string, unknown>;
  timestamp?: string;
  timestampMs?: number;
}

/**
 * Returns the partition key for a given date in YYYY-MM format.
 */
export function getYearMonthKey(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Records an activity or audit log entry into Firebase Realtime Database.
 * Automatically partitions by month (/activity-logs/YYYY-MM/...) to guarantee high performance.
 */
export async function recordActivity(input: RecordActivityInput): Promise<string> {
  const now = input.timestamp ? new Date(input.timestamp) : new Date();
  const timestamp = input.timestamp || now.toISOString();
  const timestampMs = input.timestampMs || now.getTime();
  const yearMonth = getYearMonthKey(now);
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const id = `log_${timestampMs}_${randomSuffix}`;

  const sanitizedIp = anonymizeIp(input.context?.ip);

  const logEntry: ActivityLog = {
    id,
    timestamp,
    timestampMs,
    yearMonth,
    category: input.category,
    action: input.action,
    title: input.title,
    severity: input.severity || 'info',
    user: {
      isAuthenticated: Boolean(input.user?.isAuthenticated),
      userId: input.user?.userId || null,
      userName: input.user?.userName || (input.user?.isAuthenticated ? 'Membre' : 'Visiteur anonyme'),
      userEmail: input.user?.userEmail || null,
      role: input.user?.role || (input.user?.isAuthenticated ? ['Member'] : ['Guest']),
      visitorId: input.user?.visitorId,
    },
    context: {
      path: input.context?.path || '/',
      referrer: input.context?.referrer || null,
      userAgent: input.context?.userAgent || null,
      deviceType: input.context?.deviceType || 'desktop',
      ip: sanitizedIp,
    },
    metadata: input.metadata || {},
  };

  if (isMockMode) {
    mockLogStore.set(id, logEntry);
    return id;
  }

  try {
    const db = getAdminDatabase();
    await db.ref(`activity-logs/${yearMonth}/${id}`).set(logEntry);
    return id;
  } catch (error) {
    console.error(`[activityLogger] Failed to record log to Firebase:`, error);
    // Fallback to in-memory store so execution never breaks
    mockLogStore.set(id, logEntry);
    return id;
  }
}

/**
 * Queries activity logs with flexible filters.
 */
export async function getActivityLogs(filters: ActivityLogFilter = {}): Promise<ActivityLog[]> {
  const yearMonth = filters.yearMonth || getYearMonthKey();
  let logs: ActivityLog[] = [];

  if (isMockMode) {
    logs = Array.from(mockLogStore.values()).filter((l) => l.yearMonth === yearMonth);
  } else {
    try {
      const db = getAdminDatabase();
      const snapshot = await db.ref(`activity-logs/${yearMonth}`).once('value');
      logs = snapshotToArray<ActivityLog>(snapshot);
    } catch (error) {
      console.error(`[activityLogger] Error querying logs for ${yearMonth}:`, error);
      logs = Array.from(mockLogStore.values()).filter((l) => l.yearMonth === yearMonth);
    }
  }

  // Filter by category
  if (filters.category && filters.category !== 'all') {
    logs = logs.filter((log) => log.category === filters.category);
  }

  // Filter by severity
  if (filters.severity && filters.severity !== 'all') {
    logs = logs.filter((log) => log.severity === filters.severity);
  }

  // Filter by user segment
  if (filters.userType && filters.userType !== 'all') {
    if (filters.userType === 'anonymous') {
      logs = logs.filter((log) => !log.user.isAuthenticated);
    } else if (filters.userType === 'admin') {
      logs = logs.filter(
        (log) =>
          log.user.isAuthenticated &&
          (log.user.role?.includes('Admin') || log.user.role?.includes('President'))
      );
    } else if (filters.userType === 'member') {
      logs = logs.filter((log) => log.user.isAuthenticated);
    }
  }

  // Filter by search query (case-insensitive)
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase().trim();
    logs = logs.filter((log) => {
      const matchAction = log.action.toLowerCase().includes(q);
      const matchTitle = log.title.toLowerCase().includes(q);
      const matchUser =
        log.user.userName?.toLowerCase().includes(q) ||
        log.user.userEmail?.toLowerCase().includes(q) ||
        log.user.userId?.toLowerCase().includes(q);
      const matchPath = log.context.path?.toLowerCase().includes(q);
      const matchIp = log.context.ip?.toLowerCase().includes(q);

      return matchAction || matchTitle || matchUser || matchPath || matchIp;
    });
  }

  // Filter by date range if provided
  if (filters.startDate) {
    const startMs = new Date(filters.startDate).getTime();
    logs = logs.filter((log) => log.timestampMs >= startMs);
  }
  if (filters.endDate) {
    const endMs = new Date(filters.endDate).getTime();
    logs = logs.filter((log) => log.timestampMs <= endMs);
  }

  // Sort descending by timestamp (newest first)
  logs.sort((a, b) => b.timestampMs - a.timestampMs);

  // Apply limit (default 100)
  const limit = filters.limit || 100;
  return logs.slice(0, limit);
}

/**
 * Computes aggregated statistics for a month.
 */
export async function getActivityStats(yearMonthInput?: string): Promise<ActivityStats> {
  const yearMonth = yearMonthInput || getYearMonthKey();
  const logs = await getActivityLogs({ yearMonth, limit: 2000 });

  const byCategory: Record<LogCategory, number> = {
    auth: 0,
    navigation: 0,
    participation: 0,
    admin: 0,
    security: 0,
  };

  const bySeverity: Record<LogSeverity, number> = {
    info: 0,
    warn: 0,
    error: 0,
    security: 0,
  };

  const visitorSet = new Set<string>();
  const memberSet = new Set<string>();

  for (const log of logs) {
    if (byCategory[log.category] !== undefined) {
      byCategory[log.category]++;
    }
    if (bySeverity[log.severity] !== undefined) {
      bySeverity[log.severity]++;
    }

    if (log.user.isAuthenticated && log.user.userId) {
      memberSet.add(log.user.userId);
    } else if (log.user.visitorId) {
      visitorSet.add(log.user.visitorId);
    } else if (log.context.ip) {
      visitorSet.add(log.context.ip);
    }
  }

  return {
    total: logs.length,
    byCategory,
    bySeverity,
    uniqueVisitors: visitorSet.size,
    activeMembers: memberSet.size,
    adminActionsCount: byCategory.admin,
    securityAlertsCount: byCategory.security + bySeverity.security + bySeverity.error,
  };
}

/**
 * Prunes activity logs older than a given number of days (e.g. 90 days retention).
 */
export async function pruneActivityLogs(
  olderThanDays: number = 90
): Promise<{ deletedCount: number }> {
  const cutoffMs = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
  let deletedCount = 0;

  if (isMockMode) {
    for (const [id, log] of mockLogStore.entries()) {
      if (log.timestampMs < cutoffMs) {
        mockLogStore.delete(id);
        deletedCount++;
      }
    }
    return { deletedCount };
  }

  try {
    const db = getAdminDatabase();
    const rootSnapshot = await db.ref('activity-logs').once('value');

    if (rootSnapshot.exists()) {
      const updates: Record<string, null> = {};

      rootSnapshot.forEach((monthChild: any) => {
        monthChild.forEach((logChild: any) => {
          const log = logChild.val();
          if (log.timestampMs && log.timestampMs < cutoffMs) {
            updates[`activity-logs/${monthChild.key}/${logChild.key}`] = null;
            deletedCount++;
          }
        });
      });

      if (Object.keys(updates).length > 0) {
        await db.ref().update(updates);
      }
    }

    return { deletedCount };
  } catch (error) {
    console.error(`[activityLogger] Error pruning old logs:`, error);
    return { deletedCount: 0 };
  }
}

/**
 * Helper to clear mock in-memory logs (for testing).
 */
export function _clearMockLogs(): void {
  mockLogStore.clear();
}
