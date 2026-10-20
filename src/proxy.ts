import { NextResponse, type NextRequest } from 'next/server';
import { COOKIES } from '@/constants';

const AUTH_PATHS = ['/login'];

// Redirects on the non-secret hint cookie only; the real check is the client session and the API.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasHint = request.cookies.has(COOKIES.sessionHint);
  const isAuthPath = AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!hasHint && !isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = pathname !== '/' ? `?next=${encodeURIComponent(pathname)}` : '';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|maintenance|.*\\..*).*)'],
};
