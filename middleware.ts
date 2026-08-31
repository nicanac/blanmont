import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, isSessionAdmin, SESSION_COOKIE_NAME } from './app/lib/auth/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(sessionCookie);
  const isAdmin = isSessionAdmin(session);

  // API Admin Routes protection
  if (pathname.startsWith('/api/admin/')) {
    if (!session) {
      return NextResponse.json(
        { error: 'Non authentifié. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès refusé. Droits administrateur requis.' },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  // Admin UI Pages protection
  if (pathname.startsWith('/admin')) {
    if (!session || !isAdmin) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
