/**
 * Edge-safe session token helpers (Web Crypto only).
 * Imported by middleware.ts: keep this file free of Node-only or Firebase imports,
 * otherwise the edge bundle pulls in firebase-admin and Vercel rejects the deployment.
 */
import { checkIsAdmin } from '@/app/utils/auth';

export const SESSION_COOKIE_NAME = 'ccb_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

export interface SessionUser {
  id: string;
  email: string | null;
  name: string;
  role: string[];
  photoUrl?: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

/** Minimum length for SESSION_SECRET (32 chars ≈ 192 bits of base64 entropy). */
export const SESSION_SECRET_MIN_LENGTH = 32;

/** Dev/test-only placeholder key. Never accepted in production (see getSessionSecret). */
const NON_PRODUCTION_PLACEHOLDER = 'example_dev_only_session_key_not_for_production';

/**
 * Returns the HMAC key for session tokens, or null when none is safely configured.
 *
 * Production (NODE_ENV=production, which includes Vercel previews) fails closed:
 * SESSION_SECRET must be set and at least SESSION_SECRET_MIN_LENGTH characters.
 * It never falls back to another credential (e.g. the Firebase service-account key)
 * or to a constant committed in the repository.
 */
export function getSessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret && secret.length >= SESSION_SECRET_MIN_LENGTH) {
    return secret;
  }
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  return NON_PRODUCTION_PLACEHOLDER;
}

/** Thrown when a session must be signed but no SESSION_SECRET is configured. */
export class SessionSecretMissingError extends Error {
  constructor() {
    super(
      `SESSION_SECRET is not configured (min ${SESSION_SECRET_MIN_LENGTH} characters). ` +
        'Set it in the hosting environment; sessions are disabled until then.'
    );
    this.name = 'SessionSecretMissingError';
  }
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let normalized = str.replace(/-/g, '+').replace(/_/g, '/');
  while (normalized.length % 4) {
    normalized += '=';
  }
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Signs a session payload into a tamper-proof HMAC-SHA256 token using Web Crypto API.
 */
export async function signSessionToken(payload: Omit<SessionUser, 'iat' | 'exp'>): Promise<string> {
  const secret = getSessionSecret();
  if (!secret) {
    throw new SessionSecretMissingError();
  }
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: SessionUser = {
    ...payload,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
  };

  const payloadJson = JSON.stringify(fullPayload);
  const payloadBase64 = base64UrlEncode(new TextEncoder().encode(payloadJson));

  const key = await getHmacKey(secret);
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payloadBase64)
  );
  const signatureBase64 = base64UrlEncode(new Uint8Array(signatureBuffer));

  return `${payloadBase64}.${signatureBase64}`;
}

/**
 * Verifies and decodes a session token. Returns null if invalid or expired.
 */
export async function verifySessionToken(token: string | undefined | null): Promise<SessionUser | null> {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, signatureBase64] = parts;
  const secret = getSessionSecret();
  // Fail closed: without a configured secret no token is ever valid.
  if (!secret) return null;

  try {
    const key = await getHmacKey(secret);
    const signatureBytes = base64UrlDecode(signatureBase64);
    const dataBytes = new TextEncoder().encode(payloadBase64);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as unknown as BufferSource,
      dataBytes as unknown as BufferSource
    );
    if (!isValid) return null;

    const payloadBytes = base64UrlDecode(payloadBase64);
    const payloadJson = new TextDecoder().decode(payloadBytes as unknown as BufferSource);
    const session = JSON.parse(payloadJson) as SessionUser;

    const now = Math.floor(Date.now() / 1000);
    if (session.exp && session.exp < now) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Helper to check if a session user has admin rights.
 */
export function isSessionAdmin(session: SessionUser | null): boolean {
  if (!session) return false;
  if (session.isAdmin) return true;
  return checkIsAdmin({
    id: session.id,
    username: session.email || session.name,
    name: session.name,
    email: session.email || undefined,
    role: session.role,
  });
}
