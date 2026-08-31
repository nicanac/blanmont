import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { User, Member } from '@/app/types';
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

function getSessionSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    'cc-saint-martin-blanmont-secure-secret-2026'
  );
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
 * Creates and sets the HttpOnly session cookie on the server.
 */
export async function setSessionCookie(member: Member | User): Promise<SessionUser> {
  const roles = Array.isArray(member.role)
    ? member.role
    : member.role
      ? [member.role]
      : ['Member'];

  const normalizedUser: User = {
    id: member.id,
    username: member.email || member.name,
    name: member.name,
    email: member.email || undefined,
    role: roles,
    avatarUrl: (member as any).photoUrl || (member as any).avatarUrl || '/images/default-avatar.png',
  };

  const isAdmin = checkIsAdmin(normalizedUser);

  const sessionData: Omit<SessionUser, 'iat' | 'exp'> = {
    id: normalizedUser.id,
    name: normalizedUser.name,
    email: normalizedUser.email || null,
    role: roles,
    photoUrl: normalizedUser.avatarUrl,
    isAdmin,
  };

  const token = await signSessionToken(sessionData);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return {
    ...sessionData,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
}

/**
 * Clears the session cookie.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Retrieves the current session user from server cookies (for Server Actions & Server Components).
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return await verifySessionToken(token);
}

/**
 * Retrieves session user from a NextRequest object (for API Route Handlers & Middleware).
 */
export async function getSessionUserFromRequest(request: NextRequest): Promise<SessionUser | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    // Also check Authorization header Bearer token if present
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return await verifySessionToken(authHeader.substring(7));
    }
    return null;
  }
  return await verifySessionToken(token);
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

/**
 * Requires admin privileges for API route handlers.
 * Returns { authorized: true, user } if authorized, or { authorized: false, response } with 401/403.
 */
export async function verifyAdminRequest(
  request: NextRequest
): Promise<{ authorized: true; user: SessionUser } | { authorized: false; response: NextResponse }> {
  const session = await getSessionUserFromRequest(request);

  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Non authentifié. Veuillez vous connecter.' },
        { status: 401 }
      ),
    };
  }

  if (!isSessionAdmin(session)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Accès refusé. Droits administrateur requis.' },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: session,
  };
}

/**
 * Requires admin privileges for Server Actions and Server Components.
 * Throws an Error if unauthorized.
 */
export async function requireAdminSession(): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error('Non authentifié. Veuillez vous connecter.');
  }
  if (!isSessionAdmin(session)) {
    throw new Error('Accès refusé. Droits administrateur requis.');
  }
  return session;
}
