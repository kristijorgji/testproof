import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest): NextResponse {
    if (!getSessionCookie(request)) {
        const signIn = new URL('/sign-in', request.url);
        signIn.searchParams.set('next', request.nextUrl.pathname);
        return NextResponse.redirect(signIn);
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/projects/:path*'],
};
