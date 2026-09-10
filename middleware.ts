import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, isSessionAdmin, SESSION_COOKIE_NAME } from './app/lib/auth/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(sessionCookie);
  const isAdmin = isSessionAdmin(session);

  // API Routes protection (Admin & Authenticated User)
  if (pathname.startsWith('/api/')) {
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
    } else {
      // General API protection (excluding cron jobs or public endpoints if any, but we'll secure all by default unless explicit)
      // Exception for public auth APIs if any exist
      if (!pathname.startsWith('/api/cron/') && !session) {
         return NextResponse.json(
          { error: 'Non authentifié.' },
          { status: 401 }
        );
      }
    }
    return NextResponse.next();
  }

  // General App protection (Only logged-in members can access most pages)
  const isPublicPage = pathname === '/login' || pathname === '/auth/action' || pathname === '/' || pathname.startsWith('/public');

  if (!isPublicPage && !session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - images, svg, etc. (public assets)
     */
    '/((?!_next/static|_next/image|images|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
