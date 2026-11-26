import type { FeedbackReport } from '@/app/lib/feedback/reports';
import type { FeedbackCategory, FeedbackPriority } from '@/app/lib/feedback/labels';

export type Tab = 'open' | 'resolved' | 'dismissed' | 'all';

export interface Filters {
  tab: Tab;
  query: string;
  category: 'all' | FeedbackCategory;
  priority: 'all' | FeedbackPriority;
  sort: 'recent' | 'priority' | 'votes';
}

export const DEFAULT_FILTERS: Filters = { tab: 'open', query: '', category: 'all', priority: 'all', sort: 'recent' };

const PRIORITY_RANK: Record<FeedbackPriority, number> = { critical: 0, important: 1, suggestion: 2 };

// Combining diacritical marks block, built from code points to keep the source plain ASCII.
const MARKS = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']', 'g');
const fold = (s: string): string => s.normalize('NFD').replace(MARKS, '').toLowerCase();

/** Tab, filters, accent-insensitive search over text fields and #number, then sorting. */
export function filterReports(reports: FeedbackReport[], f: Filters): FeedbackReport[] {
  const q = fold(f.query.trim().replace(/^#/, ''));
  const out = reports.filter((r) => {
    if (f.tab !== 'all' && r.status !== f.tab) return false;
    if (f.category !== 'all' && r.category !== f.category) return false;
    if (f.priority !== 'all' && r.priority !== f.priority) return false;
    if (!q) return true;
    return fold([r.title, r.comment, r.expected ?? '', r.routePath, r.author, r.id, String(r.number)].join(' ')).includes(q);
  });
  return out.sort((a, b) => {
    if (f.sort === 'priority' && PRIORITY_RANK[a.priority] !== PRIORITY_RANK[b.priority]) {
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    }
    if (f.sort === 'votes' && (a.votes ?? 0) !== (b.votes ?? 0)) return (b.votes ?? 0) - (a.votes ?? 0);
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function countByStatus(reports: FeedbackReport[]): Record<Tab, number> {
  const counts: Record<Tab, number> = { open: 0, resolved: 0, dismissed: 0, all: reports.length };
  for (const r of reports) counts[r.status]++;
  return counts;
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
];

/** "il y a 3 h" for the last week, a short date after that. */
export function relativeDate(iso: string, now = Date.now()): string {
  const diff = new Date(iso).getTime() - now;
  if (Math.abs(diff) > 7 * 86_400_000) {
    return new Date(iso).toLocaleDateString('fr-BE', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return "à l'instant";
}
