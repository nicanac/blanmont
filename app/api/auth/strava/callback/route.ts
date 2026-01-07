import { NextRequest, NextResponse } from 'next/server';
import { exchangeToken } from '../../../../lib/strava';
import { logger } from '@/app/lib/logger';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(new URL('/import/strava?error=' + error, request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/import/strava?error=no_code', request.url));
    }

    try {
        const data = await exchangeToken(code);
        const { access_token } = data;

        // Redirect back to import page with cookie
        const response = NextResponse.redirect(new URL('/import/strava', request.url));
        
        // Set secure cookie (httpOnly not strictly needed if we want client access, but safer to keep it server side or httpOnly)
        // For simplicity in this demo, we'll make it accessible or pass via server action. 
        // Best practice: HttpOnly. We'll use Server Actions to fetch data, so HttpOnly is great.
        response.cookies.set('strava_access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 3600 * 6 // 6 hours
        });

        return response;
    } catch (err) {
        logger.error('Strava Auth Error', err);
        return NextResponse.redirect(new URL('/import/strava?error=token_exchange_failed', request.url));
    }
}
