import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { POST, GET, DELETE } from '@/app/api/logs/route';
import * as sessionModule from '@/app/lib/auth/session';
import * as activityLoggerModule from '@/app/lib/logging/activityLogger';

describe('Logs API Route (/api/logs)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/logs (Ingestion)', () => {
    it('accepts valid client activity payload and returns 201', async () => {
      vi.spyOn(sessionModule, 'getSessionUserFromRequest').mockResolvedValue(null);
      vi.spyOn(activityLoggerModule, 'recordActivity').mockResolvedValue('log_12345_abc');

      const body = {
        category: 'navigation',
        action: 'traces:gpx_download',
        title: 'Téléchargement GPX : Namur',
        path: '/traces/namur',
        visitorId: 'anon_test_123',
      };

      const req = new NextRequest('http://localhost:3000/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '194.154.20.99',
        },
        body: JSON.stringify(body),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.id).toBe('log_12345_abc');
    });

    it('rejects invalid payload with 400', async () => {
      const invalidBody = {
        category: 'invalid_category',
        action: '',
      };

      const req = new NextRequest('http://localhost:3000/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidBody),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Validation failed');
    });
  });

  describe('GET /api/logs (Admin Query)', () => {
    it('returns 401/403 if user is not admin', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      } as any);

      const req = new NextRequest('http://localhost:3000/api/logs');
      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    it('returns logs list for admin request', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const mockLogs = [
        {
          id: 'log-1',
          timestamp: '2026-10-08T10:00:00Z',
          category: 'auth',
          action: 'auth:login_success',
          title: 'Connexion',
          severity: 'info',
        },
      ];
      vi.spyOn(activityLoggerModule, 'getActivityLogs').mockResolvedValue(mockLogs as any);

      const req = new NextRequest('http://localhost:3000/api/logs?limit=50');
      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.logs.length).toBe(1);
      expect(json.count).toBe(1);
    });

    it('returns aggregated stats when stats=true is requested', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const mockStats = {
        total: 42,
        byCategory: { auth: 10, navigation: 20, participation: 5, admin: 5, security: 2 },
        bySeverity: { info: 38, warn: 2, error: 1, security: 1 },
        uniqueVisitors: 15,
        activeMembers: 8,
        adminActionsCount: 5,
        securityAlertsCount: 2,
      };
      vi.spyOn(activityLoggerModule, 'getActivityStats').mockResolvedValue(mockStats as any);

      const req = new NextRequest('http://localhost:3000/api/logs?stats=true');
      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.stats.total).toBe(42);
    });
  });

  describe('DELETE /api/logs (Prune)', () => {
    it('prunes logs older than days parameter', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      vi.spyOn(activityLoggerModule, 'pruneActivityLogs').mockResolvedValue({ deletedCount: 17 });

      const req = new NextRequest('http://localhost:3000/api/logs?days=90', { method: 'DELETE' });
      const res = await DELETE(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.deletedCount).toBe(17);
    });
  });
});
