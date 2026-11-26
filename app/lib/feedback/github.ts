import type { FeedbackInput } from './schema';

const API = 'https://api.github.com';
const ASSET_DIR = 'docs/reviews/assets';
/** Screenshots live on their own branch so they never trigger a Vercel deploy or a nicode-ci release on master. */
const ASSET_BRANCH = 'feedback-assets';
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ZWSP = String.fromCharCode(0x200b);

export function getFeedbackRepo(): string {
  return process.env.GITHUB_FEEDBACK_REPO || 'nicanac/blanmont';
}

export function isGithubConfigured(): boolean {
  return Boolean(process.env.GITHUB_FEEDBACK_TOKEN);
}

export interface ParsedImage {
  ext: 'jpg' | 'png';
  base64: string;
  bytes: number;
}

/** Accepts only base64 JPEG/PNG data URLs under the size cap. */
export function parseImageDataUrl(dataUrl: string): ParsedImage | null {
  const match = /^data:image\/(jpeg|png);base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!match) return null;
  const base64 = match[2];
  const bytes = Math.floor((base64.length * 3) / 4);
  if (bytes > MAX_IMAGE_BYTES) return null;
  return { ext: match[1] === 'jpeg' ? 'jpg' : 'png', base64, bytes };
}

export function newReviewId(): string {
  return 'REV-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

/** Stops user text from pinging GitHub accounts or autolinking issues in a public repo. */
export function neutralize(text: string): string {
  return text.replace(/@/g, '@' + ZWSP).replace(/(^|\s)#(\d)/g, '$1#' + ZWSP + '$2');
}

function quote(text: string): string {
  return neutralize(text)
    .split('\n')
    .map((line) => '> ' + line)
    .join('\n');
}

export interface IssueBodyInput {
  id: string;
  report: FeedbackInput;
  author: string;
  imageUrl?: string;
}

export function buildIssueBody({ id, report, author, imageUrl }: IssueBodyInput): string {
  const { context } = report;
  const problem = [quote(report.comment)];
  if (report.expectedBehavior) {
    problem.push('', '**Comportement attendu**', quote(report.expectedBehavior));
  }
  return [
    '## Problem',
    ...problem,
    '',
    '## Context',
    '- Review ID: `' + id + '`',
    '- Category / Priority: ' + report.category + ' / ' + report.priority,
    '- Author: ' + neutralize(author),
    '- Route: `' + context.routePath.replace(/`/g, '') + '`',
    '- URL: ' + context.url.replace(/[\s<>]/g, ''),
    '- Viewport: ' + context.viewport.width + 'x' + context.viewport.height + ' @' + context.viewport.devicePixelRatio + 'x',
    '- Capture: ' + context.captureMode,
    '- User agent: ' + context.userAgent.replace(/`/g, ''),
    ...(context.consoleErrors.length
      ? ['- Console errors:', ...context.consoleErrors.map((e) => '  - `' + e.replace(/`/g, "'") + '`')]
      : []),
    '',
    '## Visual Proof',
    imageUrl ? '![' + id + '](' + imageUrl + ')' : '_No screenshot attached._',
    '',
    '## Fix',
    '1. Locate the page/component for the route above (`app/<route>/page.tsx`).',
    '2. Implement the change while keeping the "Carte IGN" design system (`DESIGN.md`).',
    '3. Run `npm run lint` and `npm test`, then reference this issue in the commit.',
    '',
    '## AC',
    '- [ ] The reported behaviour is fixed or consciously declined (reply in this issue)',
    '- [ ] Lint and tests pass',
    '',
    '## Risk',
    '- Scoped to the route above; check mobile (375px) and dark mode.',
    '',
    '_Sent from the in-app feedback tool · ' + id + '_',
  ].join('\n');
}

async function gh<T>(token: string, path: string, init?: RequestInit): Promise<{ status: number; data: T }> {
  const res = await fetch(API + path, {
    ...init,
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'blanmont-feedback',
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { status: res.status, data };
}

async function ensureAssetBranch(token: string, repo: string): Promise<void> {
  const existing = await gh(token, '/repos/' + repo + '/git/ref/heads/' + ASSET_BRANCH);
  if (existing.status === 200) return;
  if (existing.status !== 404) throw new Error('GitHub ref lookup failed: ' + existing.status);

  const info = await gh<{ default_branch: string }>(token, '/repos/' + repo);
  if (info.status !== 200) throw new Error('GitHub repo lookup failed: ' + info.status);
  const base = await gh<{ object: { sha: string } }>(
    token,
    '/repos/' + repo + '/git/ref/heads/' + info.data.default_branch
  );
  if (base.status !== 200) throw new Error('GitHub base ref lookup failed: ' + base.status);
  const created = await gh(token, '/repos/' + repo + '/git/refs', {
    method: 'POST',
    body: JSON.stringify({ ref: 'refs/heads/' + ASSET_BRANCH, sha: base.data.object.sha }),
  });
  // 422 = branch created concurrently by another request, which is fine.
  if (created.status !== 201 && created.status !== 422) {
    throw new Error('GitHub branch creation failed: ' + created.status);
  }
}

/** Commits the screenshot to the assets branch and returns a commit-SHA-pinned image URL. */
async function uploadScreenshot(token: string, repo: string, id: string, image: ParsedImage): Promise<string> {
  await ensureAssetBranch(token, repo);
  const path = ASSET_DIR + '/' + id + '.' + image.ext;
  const put = await gh<{ commit: { sha: string } }>(token, '/repos/' + repo + '/contents/' + path, {
    method: 'PUT',
    body: JSON.stringify({
      message: 'chore(feedback): add screenshot ' + id + ' [skip ci]',
      content: image.base64,
      branch: ASSET_BRANCH,
    }),
  });
  if (put.status !== 201 && put.status !== 200) throw new Error('GitHub upload failed: ' + put.status);
  return 'https://github.com/' + repo + '/blob/' + put.data.commit.sha + '/' + path + '?raw=true';
}

export interface SubmittedIssue {
  id: string;
  issueNumber: number;
  issueUrl: string;
}

/** Uploads the (optional) screenshot, then opens a GitHub issue. Throws on any GitHub failure. */
export async function submitFeedbackToGitHub(report: FeedbackInput, author: string): Promise<SubmittedIssue> {
  const token = process.env.GITHUB_FEEDBACK_TOKEN;
  if (!token) throw new Error('GITHUB_FEEDBACK_TOKEN is not set');
  const repo = getFeedbackRepo();
  const id = newReviewId();

  let imageUrl: string | undefined;
  if (report.screenshot) {
    const image = parseImageDataUrl(report.screenshot);
    if (!image) throw new Error('Invalid screenshot data URL');
    imageUrl = await uploadScreenshot(token, repo, id, image);
  }

  const issue = await gh<{ number: number; html_url: string }>(token, '/repos/' + repo + '/issues', {
    method: 'POST',
    body: JSON.stringify({
      title: '[' + id + '] ' + neutralize(report.title),
      body: buildIssueBody({ id, report, author, imageUrl }),
      labels: ['visual-feedback', report.category],
    }),
  });
  if (issue.status !== 201) throw new Error('GitHub issue creation failed: ' + issue.status);
  return { id, issueNumber: issue.data.number, issueUrl: issue.data.html_url };
}
