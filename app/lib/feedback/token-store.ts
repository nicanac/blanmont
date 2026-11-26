import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { getSessionSecret } from '@/app/lib/auth/session-token';
import { isMockMode } from '@/app/lib/firebase/client';

/**
 * GitHub token for the feedback bridge (server only).
 * Resolution order: GITHUB_FEEDBACK_TOKEN env var, then a token an admin pasted in /admin/settings.
 * The pasted token is stored in RTDB encrypted with a key derived from SESSION_SECRET, so a database
 * backup or a leaked rules misconfiguration never exposes a usable credential.
 */
const NODE = 'visual-feedback-secret';
const CACHE_MS = 60_000;

interface StoredToken {
  iv: string;
  tag: string;
  data: string;
  last4: string;
  updatedAt: string;
  updatedBy: string;
}

export type TokenSource = 'env' | 'admin' | 'none';

export interface TokenStatus {
  source: TokenSource;
  last4?: string;
  updatedAt?: string;
}

export class TokenStoreUnavailableError extends Error {}

function deriveKey(): Buffer {
  const secret = getSessionSecret();
  if (!secret) throw new TokenStoreUnavailableError('SESSION_SECRET is not configured');
  return createHash('sha256').update('feedback-token:' + secret).digest();
}

export function encryptToken(token: string, key: Buffer): Pick<StoredToken, 'iv' | 'tag' | 'data'> {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  return { iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: data.toString('base64') };
}

/** Returns null when the payload is tampered with or was encrypted under another key. */
export function decryptToken(stored: Pick<StoredToken, 'iv' | 'tag' | 'data'>, key: Buffer): string | null {
  try {
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(stored.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(stored.tag, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(stored.data, 'base64')), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}

async function readStored(): Promise<StoredToken | null> {
  if (isMockMode) return null;
  const { getAdminDatabase } = await import('@/app/lib/firebase/admin');
  const value = (await getAdminDatabase().ref(NODE).once('value')).val() as StoredToken | null;
  return value && value.data && value.iv && value.tag ? value : null;
}

// shortcut: per-instance cache, so a new token reaches other serverless instances within CACHE_MS.
let cache: { token: string | null; at: number } | null = null;

/** The token to use right now, or null when none is configured anywhere. Never throws. */
export async function getFeedbackToken(): Promise<string | null> {
  const fromEnv = process.env.GITHUB_FEEDBACK_TOKEN?.trim();
  if (fromEnv) return fromEnv;
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.token;
  let token: string | null = null;
  try {
    const stored = await readStored();
    token = stored ? decryptToken(stored, deriveKey()) : null;
  } catch (error) {
    console.error('Error reading the stored feedback token:', error instanceof Error ? error.message : 'unknown');
  }
  cache = { token, at: Date.now() };
  return token;
}

/** Where the token comes from, without ever returning the token itself. */
export async function getTokenStatus(): Promise<TokenStatus> {
  const fromEnv = process.env.GITHUB_FEEDBACK_TOKEN?.trim();
  if (fromEnv) return { source: 'env', last4: fromEnv.slice(-4) };
  try {
    const stored = await readStored();
    if (stored && decryptToken(stored, deriveKey())) {
      return { source: 'admin', last4: stored.last4, updatedAt: stored.updatedAt };
    }
  } catch {
    // unreadable store = no token
  }
  return { source: 'none' };
}

export async function saveFeedbackToken(token: string, updatedBy: string): Promise<void> {
  if (isMockMode) throw new TokenStoreUnavailableError('Firebase is not configured');
  const stored: StoredToken = {
    ...encryptToken(token, deriveKey()),
    last4: token.slice(-4),
    updatedAt: new Date().toISOString(),
    updatedBy,
  };
  const { getAdminDatabase } = await import('@/app/lib/firebase/admin');
  await getAdminDatabase().ref(NODE).set(stored);
  cache = null;
}

export async function deleteFeedbackToken(): Promise<void> {
  if (!isMockMode) {
    const { getAdminDatabase } = await import('@/app/lib/firebase/admin');
    await getAdminDatabase().ref(NODE).remove();
  }
  cache = null;
}
