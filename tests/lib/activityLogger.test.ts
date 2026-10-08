import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordActivity,
  getActivityLogs,
  getActivityStats,
  pruneActivityLogs,
  getYearMonthKey,
  _clearMockLogs,
} from '@/app/lib/logging/activityLogger';

describe('activityLogger', () => {
  beforeEach(() => {
    _clearMockLogs();
  });

  it('correctly calculates YYYY-MM key', () => {
    const date = new Date('2026-10-15T12:00:00Z');
    expect(getYearMonthKey(date)).toBe('2026-10');
  });

  it('records an anonymous activity entry and masks IP', async () => {
    const id = await recordActivity({
      category: 'navigation',
      action: 'traces:gpx_download',
      title: 'Téléchargement GPX : Namur',
      user: { isAuthenticated: false, visitorId: 'anon_123' },
      context: { ip: '194.154.20.55', path: '/traces/namur' },
      metadata: { traceName: 'Namur' },
    });

    expect(id).toMatch(/^log_\d+_/);

    const logs = await getActivityLogs();
    expect(logs.length).toBe(1);
    const entry = logs[0];
    expect(entry.id).toBe(id);
    expect(entry.action).toBe('traces:gpx_download');
    expect(entry.context.ip).toBe('194.154.20.xxx');
    expect(entry.user.isAuthenticated).toBe(false);
  });

  it('filters activity logs by category, severity, and user segment', async () => {
    await recordActivity({
      category: 'auth',
      action: 'auth:login_success',
      title: 'Connexion de Marc',
      severity: 'info',
      user: { isAuthenticated: true, userId: 'm1', userName: 'Marc Dupont', role: ['Member'] },
    });

    await recordActivity({
      category: 'admin',
      action: 'admin:attendance_marked',
      title: 'Pointage de présence',
      severity: 'warn',
      user: { isAuthenticated: true, userId: 'adm1', userName: 'Admin Nicolas', role: ['Admin'] },
    });

    await recordActivity({
      category: 'security',
      action: 'security:unauthorized_admin_api',
      title: 'Accès refusé',
      severity: 'security',
      user: { isAuthenticated: false },
    });

    // Filter category
    const authLogs = await getActivityLogs({ category: 'auth' });
    expect(authLogs.length).toBe(1);
    expect(authLogs[0].action).toBe('auth:login_success');

    // Filter severity
    const securityLogs = await getActivityLogs({ severity: 'security' });
    expect(securityLogs.length).toBe(1);

    // Filter userType: admin
    const adminLogs = await getActivityLogs({ userType: 'admin' });
    expect(adminLogs.length).toBe(1);
    expect(adminLogs[0].user.userName).toBe('Admin Nicolas');

    // Filter userType: anonymous
    const anonLogs = await getActivityLogs({ userType: 'anonymous' });
    expect(anonLogs.length).toBe(1);
  });

  it('filters activity logs by search query', async () => {
    await recordActivity({
      category: 'participation',
      action: 'participation:saturday_vote',
      title: 'Vote pour la trace de Chaumont',
      user: { isAuthenticated: true, userName: 'Fabian', userEmail: 'fabian@blanmont.be' },
    });

    await recordActivity({
      category: 'navigation',
      action: 'traces:gpx_download',
      title: 'Téléchargement GPX : Wavre',
      user: { isAuthenticated: false },
    });

    const searchResults = await getActivityLogs({ searchQuery: 'Chaumont' });
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].title).toContain('Chaumont');

    const emailResults = await getActivityLogs({ searchQuery: 'fabian@blanmont.be' });
    expect(emailResults.length).toBe(1);
  });

  it('computes activity stats accurately', async () => {
    await recordActivity({
      category: 'auth',
      action: 'auth:login_success',
      title: 'Login 1',
      severity: 'info',
      user: { isAuthenticated: true, userId: 'u1', userName: 'User 1' },
    });

    await recordActivity({
      category: 'admin',
      action: 'admin:event_created',
      title: 'Sortie créée',
      severity: 'info',
      user: { isAuthenticated: true, userId: 'adm1', role: ['Admin'] },
    });

    await recordActivity({
      category: 'security',
      action: 'security:access_blocked',
      title: 'Tentative bloquée',
      severity: 'security',
      user: { isAuthenticated: false, visitorId: 'anon_999' },
    });

    const stats = await getActivityStats();
    expect(stats.total).toBe(3);
    expect(stats.byCategory.auth).toBe(1);
    expect(stats.byCategory.admin).toBe(1);
    expect(stats.byCategory.security).toBe(1);
    expect(stats.activeMembers).toBe(2);
    expect(stats.uniqueVisitors).toBe(1);
    expect(stats.securityAlertsCount).toBeGreaterThan(0);
  });

  it('prunes activity logs older than retention cutoff', async () => {
    // Record old entry
    const oldTimestamp = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString();
    await recordActivity({
      category: 'navigation',
      action: 'page:view',
      title: 'Ancienne vue de page',
      timestamp: oldTimestamp,
      timestampMs: new Date(oldTimestamp).getTime(),
    });

    // Record recent entry
    await recordActivity({
      category: 'navigation',
      action: 'page:view',
      title: 'Vue récente',
    });

    const { deletedCount } = await pruneActivityLogs(); // default 90 days
    expect(deletedCount).toBe(1);

    const remaining = await getActivityLogs();
    expect(remaining.length).toBe(1);
    expect(remaining[0].title).toBe('Vue récente');
  });
});
