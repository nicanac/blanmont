import { describe, it, expect, afterEach, vi } from 'vitest';
import { buildIssueBody, neutralize } from '@/app/lib/feedback/github';
import {
  actOnReport,
  parseComment,
  parseIssue,
  ReportNotFoundError,
  type GhIssue,
} from '@/app/lib/feedback/reports';
import type { FeedbackInput } from '@/app/lib/feedback/schema';

const input: FeedbackInput = {
  title: 'Bouton cassé',
  comment: 'Le bouton ne répond pas\nsur mobile @nicanac',
  expectedBehavior: 'Il doit ouvrir le menu',
  category: 'bug',
  priority: 'critical',
  context: {
    url: 'https://blanmont.vercel.app/calendrier',
    routePath: '/calendrier',
    viewport: { width: 375, height: 812, devicePixelRatio: 3 },
    userAgent: 'Mozilla/5.0 Test',
    captureMode: 'native_tab',
    consoleErrors: ['TypeError: x is undefined'],
  },
};

const IMG = 'https://github.com/o/r/blob/abc/docs/reviews/assets/REV-1.jpg?raw=true';

function issue(over: Partial<GhIssue> = {}): GhIssue {
  return {
    number: 12,
    title: '[REV-abc1] ' + neutralize(input.title),
    body: buildIssueBody({ id: 'REV-abc1', report: input, author: 'Nicolas', imageUrl: IMG }),
    state: 'open',
    state_reason: null,
    html_url: 'https://github.com/o/r/issues/12',
    created_at: '2026-11-26T08:00:00Z',
    updated_at: '2026-11-26T08:00:00Z',
    comments: 2,
    labels: [{ name: 'visual-feedback' }, { name: 'bug' }],
    ...over,
  };
}

describe('feedback report parsing', () => {
  it('round-trips an issue written by the bridge', () => {
    const r = parseIssue(issue());
    expect(r).toMatchObject({
      number: 12,
      id: 'REV-abc1',
      title: 'Bouton cassé',
      status: 'open',
      category: 'bug',
      priority: 'critical',
      author: 'Nicolas',
      routePath: '/calendrier',
      viewport: '375×812 @3x',
      captureMode: 'native_tab',
      consoleErrors: ['TypeError: x is undefined'],
      imageUrl: IMG,
      expected: 'Il doit ouvrir le menu',
      commentsCount: 2,
    });
    expect(r.comment).toContain('sur mobile');
    expect(r.comment).toContain('@nicanac'); // the invisible guard character is stripped for display
  });

  it('maps GitHub state to the three statuses', () => {
    expect(parseIssue(issue({ state: 'closed', state_reason: 'completed' })).status).toBe('resolved');
    expect(parseIssue(issue({ state: 'closed', state_reason: 'not_planned' })).status).toBe('dismissed');
  });

  it('only trusts images hosted on GitHub', () => {
    const body = '## Problem\n> x\n## Context\n- Review ID: `REV-z`\n## Visual Proof\n![a](https://evil.test/p.png)';
    expect(parseIssue(issue({ body })).imageUrl).toBeUndefined();
  });

  it('survives a hand-written issue with the label', () => {
    const r = parseIssue(issue({ title: 'Idée libre', body: null, labels: ['visual-feedback', 'feature'] }));
    expect(r).toMatchObject({ title: 'Idée libre', category: 'feature', priority: 'important', routePath: '/' });
  });

  it('reads replies posted from the app and from GitHub', () => {
    const app = parseComment({ id: 1, body: "**Paul (Trésorier)** · via l'application\n\nMarqué comme résolu.", created_at: 'x' });
    expect(app).toMatchObject({ author: 'Paul (Trésorier)', text: 'Marqué comme résolu.', viaApp: true });
    expect(parseComment({ id: 2, body: 'hello', created_at: 'x', user: { login: 'nicanac' } })).toMatchObject({
      author: 'nicanac',
      viaApp: false,
    });
  });
});

describe('acting on a report', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  function stubGithub(current: GhIssue) {
    const calls: string[] = [];
    vi.stubEnv('GITHUB_FEEDBACK_TOKEN', 'tok');
    vi.stubEnv('GITHUB_FEEDBACK_REPO', 'o/r');
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        const key = (init?.method ?? 'GET') + ' ' + url.replace('https://api.github.com/repos/o/r', '');
        calls.push(key + (init?.body ? ' ' + init.body : ''));
        const body = key === 'GET /issues/12' ? current : key.startsWith('PATCH') ? {} : {};
        const status = key.startsWith('POST') ? 201 : 200;
        return Promise.resolve({ status, json: () => Promise.resolve(body) } as Response);
      })
    );
    return calls;
  }

  it('resolves: closes as completed and signs the reply with the person', async () => {
    const calls = stubGithub(issue());
    await actOnReport(12, 'resolve', 'Corrigé en v0.35', { name: 'Paul', role: 'Trésorier' });
    expect(calls.some((c) => c.startsWith('PATCH /issues/12') && c.includes('"state_reason":"completed"'))).toBe(true);
    const comment = calls.find((c) => c.startsWith('POST /issues/12/comments'))!;
    expect(comment).toContain('Paul (Trésorier)');
    expect(comment).toContain('Corrigé en v0.35');
  });

  it('dismisses as not planned and reopens', async () => {
    const calls = stubGithub(issue());
    await actOnReport(12, 'dismiss', undefined, { name: 'Paul', role: 'Admin' });
    await actOnReport(12, 'reopen', undefined, { name: 'Paul', role: 'Admin' });
    expect(calls.some((c) => c.includes('"state_reason":"not_planned"'))).toBe(true);
    expect(calls.some((c) => c.includes('"state":"open"'))).toBe(true);
  });

  it('a plain reply does not change the status', async () => {
    const calls = stubGithub(issue());
    await actOnReport(12, 'comment', 'Merci !', { name: 'Paul', role: 'Admin' });
    expect(calls.some((c) => c.startsWith('PATCH'))).toBe(false);
  });

  it('refuses issues that are not feedback reports', async () => {
    const calls = stubGithub(issue({ labels: [{ name: 'bug' }] }));
    await expect(actOnReport(12, 'resolve', undefined, { name: 'P', role: 'Admin' })).rejects.toBeInstanceOf(ReportNotFoundError);
    expect(calls.some((c) => c.startsWith('PATCH'))).toBe(false);
  });
});
