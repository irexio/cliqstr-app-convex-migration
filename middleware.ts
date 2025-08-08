import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Public paths that must remain accessible while logged out
const PUBLIC_PATHS = [
  '/', '/sign-in', '/sign-up',
  '/verify-email', '/verification-success', '/verification-error',
  '/invite/accept', '/invite/invalid', '/invite/declined', '/invite/sent',
  '/email-confirmation',
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '?'));
}

// Paths a pending child is NOT allowed to access
function isChildProtectedPath(pathname: string) {
  if (pathname === '/my-cliqs-dashboard') return true;
  if (pathname.startsWith('/cliqs/')) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Always allow static assets and API calls to pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next();
  }

  // Always allow public pages (invite accept, auth, home, etc.)
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check auth quickly via existing status route
  try {
    const origin = req.nextUrl.origin;
    const statusRes = await fetch(`${origin}/api/auth/status`, {
      headers: { cookie: req.headers.get('cookie') || '' },
      cache: 'no-store',
    });

    const status = statusRes.ok ? await statusRes.json() : null;
    const user = status?.user;

    // If not authenticated and not on a public page, send to sign-in with returnTo
    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = '/sign-in';
      url.search = `?returnTo=${encodeURIComponent(pathname + (search || ''))}`;
      return NextResponse.redirect(url);
    }

    // If user is a CHILD and still pending, block protected paths
    // We rely on /api/auth/status to expose user.role === 'Child' and user.approval === 'pending' if you have it.
    // If it doesn't, the server-side guard (8B) will still cover all RSC pages.
    if (user.role === 'Child' && user.approval === 'pending' && isChildProtectedPath(pathname)) {
      const url = req.nextUrl.clone();
      url.pathname = '/awaiting-approval';
      url.search = '';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (err) {
    // On failure, fail open for public, otherwise send to sign-in
    if (isPublicPath(pathname)) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = '/sign-in';
    url.search = `?returnTo=${encodeURIComponent(pathname + (search || ''))}`;
    return NextResponse.redirect(url);
  }
}

// Limit middleware to app pages (not assets)
// Adjust matchers if you have special folders to exclude.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
