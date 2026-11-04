import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { User, Member } from '@/app/types';
import { checkIsAdmin } from '@/app/utils/auth';
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  signSessionToken,
  verifySessionToken,
  isSessionAdmin,
  type SessionUser,
} from './session-token';

export {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  signSessionToken,
  verifySessionToken,
  isSessionAdmin,
  type SessionUser,
};

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
 * Requires admin privileges for API route handlers.
 * Returns { authorized: true, user } if authorized, or { authorized: false, response } with 401/403.
 */
export async function verifyAdminRequest(
  request: NextRequest
): Promise<{ authorized: true; user: SessionUser } | { authorized: false; response: NextResponse }> {
  const session = await getSessionUserFromRequest(request);

  if (!session) {
    // Lazily record security alert without blocking response
    import('../logging/activityLogger').then(({ recordActivity }) => {
      import('../logging/ipAnonymizer').then(({ extractClientIp }) => {
        recordActivity({
          category: 'security',
          action: 'security:unauthorized_admin_api',
          title: `Accès non authentifié bloqué sur ${request.nextUrl.pathname}`,
          severity: 'security',
          user: { isAuthenticated: false },
          context: {
            path: request.nextUrl.pathname,
            ip: extractClientIp(request.headers),
          },
        }).catch(() => {});
      });
    }).catch(() => {});

    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Non authentifié. Veuillez vous connecter.' },
        { status: 401 }
      ),
    };
  }

  if (!isSessionAdmin(session)) {
    import('../logging/activityLogger').then(({ recordActivity }) => {
      import('../logging/ipAnonymizer').then(({ extractClientIp }) => {
        recordActivity({
          category: 'security',
          action: 'security:forbidden_admin_api',
          title: `Accès admin interdit pour ${session.name}`,
          severity: 'security',
          user: {
            isAuthenticated: true,
            userId: session.id,
            userName: session.name,
            userEmail: session.email,
            role: session.role,
          },
          context: {
            path: request.nextUrl.pathname,
            ip: extractClientIp(request.headers),
          },
        }).catch(() => {});
      });
    }).catch(() => {});

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
