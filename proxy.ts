import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, isSessionAdmin, isSessionOwner, SESSION_COOKIE_NAME } from './app/lib/auth/session-token';
import { allowedAdminSections } from './app/lib/auth/admin-access';
import { DASHBOARD, OWNER_ONLY, sectionForPath } from './app/constants/admin-sections';

// Runtime: Next 16 renamed middleware.ts to proxy.ts, and Proxy always runs on the Node.js runtime
// (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md), so it can read the
// RTDB access matrix with the Admin SDK; the 60 s matrix cache lives per proxy instance (admin-access.ts).
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isApi = pathname === '/api/admin' || pathname.startsWith('/api/admin/');
  if (!isApi && pathname !== '/admin' && !pathname.startsWith('/admin/')) {
    return NextResponse.next();
  }

  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!session) {
    if (isApi) {
      return NextResponse.json({ error: 'Non authentifié. Veuillez vous connecter.' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const target = sectionForPath(pathname); // null = unknown path: denied
  const isAdmin = isSessionAdmin(session);
  const allowed = isAdmin ? [] : await allowedAdminSections(session);
  let permitted: boolean;
  if (target === OWNER_ONLY) {
    // Paramètres: its API is owner-only; admins may load the page, which shows « Réservé au propriétaire du site »
    // to non-owners (app/admin/settings/layout.tsx).
    permitted = isApi ? isSessionOwner(session) : isAdmin;
  } else {
    permitted = isAdmin || (target === DASHBOARD ? allowed.length > 0 : allowed.some((id) => id === target));
  }
  if (permitted) {
    return NextResponse.next();
  }

  if (isApi) {
    return NextResponse.json({ error: 'Accès refusé. Droits administrateur requis.' }, { status: 403 });
  }
  return NextResponse.redirect(new URL(isAdmin || allowed.length > 0 ? '/admin?acces=refuse' : '/', request.url));
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
