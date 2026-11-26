import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  parseImageDataUrl,
  buildIssueBody,
  neutralize,
  submitFeedbackToGitHub,
} from '@/app/lib/feedback/github';
import type { FeedbackInput } from '@/app/lib/feedback/schema';

const report: FeedbackInput = {
  title: 'Bouton cassé @nicanac',
  comment: 'Voir #12 et ping @someone\nligne 2',
  expectedBehavior: 'Doit marcher',
  category: 'bug',
  priority: 'important',
  screenshot: 'data:image/jpeg;base64,QUJD',
  context: {
    url: 'https://blanmont.vercel.app/calendrier',
    routePath: '/calendrier',
    viewport: { width: 375, height: 812, devicePixelRatio: 3 },
    userAgent: 'UA',
    captureMode: 'native_tab',
    consoleErrors: ['Boom `x`'],
  },
};

function jsonResponse(status: number, body: unknown) {
  return Promise.resolve({ status, json: () => Promise.resolve(body) } as Response);
}

describe('feedback GitHub bridge', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('accepts only small base64 JPEG/PNG data URLs', () => {
    expect(parseImageDataUrl('data:image/jpeg;base64,QUJD')).toMatchObject({ ext: 'jpg', base64: 'QUJD' });
    expect(parseImageDataUrl('data:image/png;base64,QUJD')?.ext).toBe('png');
    expect(parseImageDataUrl('data:image/svg+xml;base64,QUJD')).toBeNull();
    expect(parseImageDataUrl('data:text/html;base64,QUJD')).toBeNull();
    expect(parseImageDataUrl('https://evil.test/x.png')).toBeNull();
    expect(parseImageDataUrl('data:image/png;base64,' + 'A'.repeat(6 * 1024 * 1024))).toBeNull();
  });

  it('defuses mentions and issue references', () => {
    expect(neutralize('hi @nicanac')).not.toContain('@nicanac');
    expect(neutralize('see #12')).not.toContain('#12');
  });

  it('builds the issue body sections and keeps user text quoted', () => {
    const body = buildIssueBody({ id: 'REV-1', report, author: 'Nico', imageUrl: 'https://x/y.jpg' });
    for (const h of ['## Problem', '## Context', '## Visual Proof', '## Fix', '## AC', '## Risk']) {
      expect(body).toContain(h);
    }
    expect(body).toContain('![REV-1](https://x/y.jpg)');
    expect(body).toContain('> ligne 2');
    expect(body).not.toContain('@someone');
  });

  it('refuses to run without a token', async () => {
    vi.stubEnv('GITHUB_FEEDBACK_TOKEN', '');
    await expect(submitFeedbackToGitHub(report, 'Nico')).rejects.toThrow(/token/i);
  });

  it('creates the assets branch when missing, uploads the screenshot, then opens the issue', async () => {
    vi.stubEnv('GITHUB_FEEDBACK_TOKEN', 'tok');
    vi.stubEnv('GITHUB_FEEDBACK_REPO', 'o/r');
    const calls: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, init?: RequestInit) => {
        const key = (init?.method ?? 'GET') + ' ' + url.replace('https://api.github.com', '');
        calls.push(key);
        if (key === 'GET /repos/o/r/git/ref/heads/feedback-assets') return jsonResponse(404, {});
        if (key === 'GET /repos/o/r') return jsonResponse(200, { default_branch: 'master' });
        if (key === 'GET /repos/o/r/git/ref/heads/master') return jsonResponse(200, { object: { sha: 'base' } });
        if (key === 'POST /repos/o/r/git/refs') return jsonResponse(201, {});
        if (key.startsWith('PUT /repos/o/r/contents/docs/reviews/assets/')) return jsonResponse(201, { commit: { sha: 'abc123' } });
        if (key === 'POST /repos/o/r/issues') return jsonResponse(201, { number: 7, html_url: 'https://github.com/o/r/issues/7' });
        return jsonResponse(500, {});
      })
    );
    const issue = await submitFeedbackToGitHub(report, 'Nico');
    expect(issue).toMatchObject({ issueNumber: 7, issueUrl: 'https://github.com/o/r/issues/7' });
    expect(calls).toHaveLength(6);
    const issueCall = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.at(-1)!;
    expect(JSON.parse(issueCall[1].body).body).toContain('https://github.com/o/r/blob/abc123/docs/reviews/assets/');
  });

  it('surfaces a GitHub failure', async () => {
    vi.stubEnv('GITHUB_FEEDBACK_TOKEN', 'tok');
    vi.stubGlobal('fetch', vi.fn(() => jsonResponse(500, {})));
    await expect(submitFeedbackToGitHub(report, 'Nico')).rejects.toThrow(/GitHub/);
  });
});
