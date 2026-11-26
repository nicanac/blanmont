import { describe, it, expect } from 'vitest';
import { DEFAULT_FILTERS, countByStatus, filterReports, relativeDate } from '@/app/components/feedback/reports/filters';
import type { FeedbackReport } from '@/app/lib/feedback/reports';

const base: FeedbackReport = {
  number: 1, id: 'REV-1', title: 'Titre', status: 'open', category: 'ui', priority: 'important', author: 'Nico',
  comment: 'texte', routePath: '/', consoleErrors: [], issueUrl: 'u', commentsCount: 0,
  createdAt: '2026-11-20T10:00:00Z', updatedAt: '2026-11-20T10:00:00Z',
};
const list: FeedbackReport[] = [
  { ...base, number: 1, title: 'Calendrier cassé', priority: 'suggestion', createdAt: '2026-11-20T10:00:00Z' },
  { ...base, number: 2, title: 'Bouton Rejoindre', priority: 'critical', category: 'bug', createdAt: '2026-11-21T10:00:00Z' },
  { ...base, number: 3, title: 'Fôte de frappe', status: 'resolved', category: 'copy', createdAt: '2026-11-22T10:00:00Z' },
  { ...base, number: 4, title: 'Idée', status: 'dismissed', category: 'feature', createdAt: '2026-11-23T10:00:00Z' },
];

describe('report filters', () => {
  it('shows only open reports by default, newest first', () => {
    expect(filterReports(list, DEFAULT_FILTERS).map((r) => r.number)).toEqual([2, 1]);
  });

  it('sorts by urgency on demand', () => {
    expect(filterReports(list, { ...DEFAULT_FILTERS, sort: 'priority' }).map((r) => r.number)).toEqual([2, 1]);
    expect(filterReports(list, { ...DEFAULT_FILTERS, tab: 'all', sort: 'priority' })[0].number).toBe(2);
  });

  it('sorts by votes on demand, newest first on a tie', () => {
    const voted = list.map((r) => ({ ...r, votes: r.number === 1 ? 3 : r.number === 3 ? 1 : undefined }));
    expect(filterReports(voted, { ...DEFAULT_FILTERS, tab: 'all', sort: 'votes' }).map((r) => r.number)).toEqual([1, 3, 4, 2]);
  });

  it('filters by type and priority', () => {
    expect(filterReports(list, { ...DEFAULT_FILTERS, tab: 'all', category: 'copy' }).map((r) => r.number)).toEqual([3]);
    expect(filterReports(list, { ...DEFAULT_FILTERS, tab: 'all', priority: 'critical' }).map((r) => r.number)).toEqual([2]);
  });

  it('searches without caring about accents, case or a leading #', () => {
    expect(filterReports(list, { ...DEFAULT_FILTERS, tab: 'all', query: 'FOTE' }).map((r) => r.number)).toEqual([3]);
    expect(filterReports(list, { ...DEFAULT_FILTERS, tab: 'all', query: '#4' }).map((r) => r.number)).toEqual([4]);
  });

  it('counts per status', () => {
    expect(countByStatus(list)).toEqual({ open: 2, resolved: 1, dismissed: 1, all: 4 });
  });

  it('formats dates relatively for a week, then absolutely', () => {
    const now = new Date('2026-11-26T12:00:00Z').getTime();
    expect(relativeDate('2026-11-26T09:00:00Z', now)).toMatch(/3/);
    expect(relativeDate('2026-11-26T11:59:50Z', now)).toBe("à l'instant");
    expect(relativeDate('2026-10-01T09:00:00Z', now)).toMatch(/2026/);
  });
});
