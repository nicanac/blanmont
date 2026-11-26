import { gh, getFeedbackRepo, neutralize, ZWSP } from './github';
import { FEEDBACK_CATEGORIES, FEEDBACK_PRIORITIES } from './schema';
import type { FeedbackCategory, FeedbackPriority, ReportStatus } from './labels';

export interface FeedbackReport {
  number: number;
  id: string;
  title: string;
  status: ReportStatus;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  author: string;
  comment: string;
  expected?: string;
  routePath: string;
  pageUrl?: string;
  viewport?: string;
  captureMode?: string;
  userAgent?: string;
  consoleErrors: string[];
  imageUrl?: string;
  issueUrl: string;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportComment {
  id: number;
  author: string;
  text: string;
  createdAt: string;
  viaApp: boolean;
}

export type ReportAction = 'comment' | 'resolve' | 'dismiss' | 'reopen';

export class ReportNotFoundError extends Error {}

export const REPORT_LABEL = 'visual-feedback';

export interface GhIssue {
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  state_reason?: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  comments: number;
  labels: ({ name?: string } | string)[];
  pull_request?: unknown;
}

const clean = (s: string): string => s.split(ZWSP).join('').trim();
const unquote = (s: string): string =>
  clean(
    s
      .split('\n')
      .map((l) => l.replace(/^>\s?/, ''))
      .join('\n')
  );

function field(body: string, label: string): string | undefined {
  const m = new RegExp('^- ' + label + ': (.*)$', 'm').exec(body);
  return m?.[1]?.trim() || undefined;
}

/** Only images committed to GitHub are shown: an edited issue body cannot make the page load a tracker. */
function safeImage(url: string | undefined): string | undefined {
  return url && /^https:\/\/(github\.com|raw\.githubusercontent\.com)\//.test(url) ? url : undefined;
}

/** Turns an issue created by the feedback bridge (see buildIssueBody) back into a typed report. */
export function parseIssue(issue: GhIssue): FeedbackReport {
  const body = issue.body ?? '';
  const labels = issue.labels.map((l) => (typeof l === 'string' ? l : (l.name ?? '')));

  const [rawCat, rawPrio] = (field(body, 'Category / Priority') ?? '').split('/').map((s) => s.trim());
  const category =
    (FEEDBACK_CATEGORIES as readonly string[]).includes(rawCat)
      ? (rawCat as FeedbackCategory)
      : ((labels.find((l) => (FEEDBACK_CATEGORIES as readonly string[]).includes(l)) as FeedbackCategory) ?? 'ui');
  const priority = (FEEDBACK_PRIORITIES as readonly string[]).includes(rawPrio)
    ? (rawPrio as FeedbackPriority)
    : 'important';

  const problemBlock = /## Problem\n([\s\S]*?)\n## Context/.exec(body)?.[1] ?? '';
  const [problem, expected] = problemBlock.split('**Comportement attendu**');

  const viewport = /(\d+)x(\d+) @([\d.]+)x/.exec(field(body, 'Viewport') ?? '');
  const idFromTitle = /^\[(REV-[a-z0-9]+)\]\s*/.exec(issue.title);

  const status: ReportStatus =
    issue.state === 'open' ? 'open' : issue.state_reason === 'not_planned' ? 'dismissed' : 'resolved';

  return {
    number: issue.number,
    id: idFromTitle?.[1] ?? (field(body, 'Review ID') ?? '').replace(/`/g, ''),
    title: clean(issue.title.replace(/^\[REV-[a-z0-9]+\]\s*/, '')),
    status,
    category,
    priority,
    author: clean(field(body, 'Author') ?? 'Inconnu'),
    comment: unquote(problem ?? '') || '(sans description)',
    expected: expected ? unquote(expected) || undefined : undefined,
    routePath: (field(body, 'Route') ?? '/').replace(/`/g, ''),
    pageUrl: field(body, 'URL'),
    viewport: viewport ? viewport[1] + '×' + viewport[2] + ' @' + viewport[3] + 'x' : undefined,
    captureMode: field(body, 'Capture'),
    userAgent: field(body, 'User agent'),
    consoleErrors: [...body.matchAll(/^ {2}- `(.*)`$/gm)].map((m) => m[1]),
    imageUrl: safeImage(/!\[[^\]]*\]\((https:[^)\s]+)\)/.exec(body)?.[1]),
    issueUrl: issue.html_url,
    commentsCount: issue.comments,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
  };
}

const VIA_APP = /^\*\*(.+?)\*\* · via l'application\n\n([\s\S]*)$/;

export function parseComment(c: { id: number; body: string; created_at: string; user?: { login?: string } | null }): ReportComment {
  const m = VIA_APP.exec(c.body ?? '');
  return {
    id: c.id,
    author: m ? m[1] : (c.user?.login ?? 'GitHub'),
    text: clean(m ? m[2] : (c.body ?? '')),
    createdAt: c.created_at,
    viaApp: Boolean(m),
  };
}

const ctx = (): { token: string; repo: string } => {
  const token = process.env.GITHUB_FEEDBACK_TOKEN;
  if (!token) throw new Error('GITHUB_FEEDBACK_TOKEN is not set');
  return { token, repo: getFeedbackRepo() };
};

const PAGE = 100;
const MAX_PAGES = 3; // shortcut: 300 most recent reports; add server-side paging when the club outgrows it.

/** Every report (open and closed), newest first. */
export async function listReports(): Promise<FeedbackReport[]> {
  const { token, repo } = ctx();
  const out: FeedbackReport[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await gh<GhIssue[]>(
      token,
      '/repos/' + repo + '/issues?labels=' + REPORT_LABEL + '&state=all&sort=created&direction=desc&per_page=' + PAGE + '&page=' + page
    );
    if (res.status !== 200) throw new Error('GitHub list failed: ' + res.status);
    out.push(...res.data.filter((i) => !i.pull_request).map(parseIssue));
    if (res.data.length < PAGE) break;
  }
  return out;
}

/** Loads an issue and refuses anything that is not a feedback report (the token must not edit other issues). */
async function loadReport(token: string, repo: string, number: number): Promise<GhIssue> {
  const res = await gh<GhIssue>(token, '/repos/' + repo + '/issues/' + number);
  if (res.status === 404) throw new ReportNotFoundError();
  if (res.status !== 200) throw new Error('GitHub issue lookup failed: ' + res.status);
  const labels = res.data.labels.map((l) => (typeof l === 'string' ? l : l.name));
  if (res.data.pull_request || !labels.includes(REPORT_LABEL)) throw new ReportNotFoundError();
  return res.data;
}

export async function getReportDetail(number: number): Promise<{ report: FeedbackReport; comments: ReportComment[] }> {
  const { token, repo } = ctx();
  const issue = await loadReport(token, repo, number);
  const res = await gh<{ id: number; body: string; created_at: string; user?: { login?: string } }[]>(
    token,
    '/repos/' + repo + '/issues/' + number + '/comments?per_page=100'
  );
  if (res.status !== 200) throw new Error('GitHub comments failed: ' + res.status);
  return { report: parseIssue(issue), comments: res.data.map(parseComment) };
}

const STATUS_NOTE: Record<Exclude<ReportAction, 'comment'>, string> = {
  resolve: 'Marqué comme résolu.',
  dismiss: 'Écarté (ne sera pas traité).',
  reopen: 'Rouvert.',
};

/** Changes the status and/or adds a reply. The acting person is written in a comment: the token is shared. */
export async function actOnReport(
  number: number,
  action: ReportAction,
  text: string | undefined,
  actor: { name: string; role: string }
): Promise<FeedbackReport> {
  const { token, repo } = ctx();
  await loadReport(token, repo, number);

  if (action !== 'comment') {
    const patch =
      action === 'reopen'
        ? { state: 'open' }
        : { state: 'closed', state_reason: action === 'resolve' ? 'completed' : 'not_planned' };
    const res = await gh(token, '/repos/' + repo + '/issues/' + number, { method: 'PATCH', body: JSON.stringify(patch) });
    if (res.status !== 200) throw new Error('GitHub status change failed: ' + res.status);
  }

  const parts = [action === 'comment' ? '' : STATUS_NOTE[action], text ? neutralize(text) : ''].filter(Boolean);
  if (parts.length) {
    const body = '**' + actor.name + ' (' + actor.role + ')** · via l\'application\n\n' + parts.join('\n\n');
    const res = await gh(token, '/repos/' + repo + '/issues/' + number + '/comments', {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
    if (res.status !== 201) throw new Error('GitHub comment failed: ' + res.status);
  }
  return parseIssue(await loadReport(token, repo, number));
}
