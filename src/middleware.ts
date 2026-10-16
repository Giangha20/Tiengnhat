import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that anyone can access without authentication
const PUBLIC_PATHS = [
  '/dang-nhap',
  '/dang-ky',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/sync',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow static files, next internals, and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/audio') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml')
  ) {
    return NextResponse.next();
  }

  // 2. Check for active session cookie
  const sessionToken = request.cookies.get('nihongo_session')?.value;
  const isAuthPage = pathname === '/dang-nhap' || pathname === '/dang-ky';
  const isPublicApi = pathname.startsWith('/api/auth') || pathname.startsWith('/api/sync');

  // Allow public auth API routes
  if (isPublicApi) {
    return NextResponse.next();
  }

  // 3. If user is NOT logged in and trying to access any page other than login/register:
  if (!sessionToken && !isAuthPage) {
    const loginUrl = new URL('/dang-nhap', request.url);
    // Keep target return URL if accessing a deep link
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 4. If user IS already logged in and tries to access login or register page:
  if (sessionToken && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
