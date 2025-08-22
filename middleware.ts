import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Public paths that must remain accessible while logged out
const PUBLIC_PATHS = [
  '/', '/sign-in', '/sign-up',
  // Waitlist page (case-insensitive allowance)
  '/waitlist', '/Waitlist',
  '/verify-email', '/verification-success', '/verification-error',
  // Invite flows: allow the entire /invite/* space (token links, manual, legacy accept)
  '/invite', '/invite/accept', '/invite/invalid', '/invite/declined', '/invite/sent', '/invite/manual',
  // TEMP: allow mocked plan selection while unauthenticated (remove when Stripe is live)
  '/choose-plan',
  '/email-confirmation',
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) =>
    pathname === p ||
    pathname.startsWith(p + '?') ||
    pathname.startsWith(p + '/') // enable wildcard-like behavior for groups such as /invite/*
  );
}

// Paths a pending child is NOT allowed to access
function isChildProtectedPath(pathname: string) {
  if (pathname === '/my-cliqs-dashboard') return true;
  if (pathname.startsWith('/cliqs/')) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Canonical host redirect (production only): force apex cliqstr.com
  // Avoid on localhost and vercel preview deployments
  try {
    const host = req.headers.get('host') || '';
    const isLocal = host.includes('localhost') || host.startsWith('127.0.0.1');
    const isVercelPreview = host.endsWith('.vercel.app');
    if (process.env.NODE_ENV === 'production' && !isLocal && !isVercelPreview) {
      if (host === 'www.cliqstr.com') {
        const url = req.nextUrl.clone();
        url.host = 'cliqstr.com';
        url.protocol = 'https';
        return NextResponse.redirect(url, 308);
      }
    }
  } catch {}

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
      // Special case: Allow /parents/hq access if there's a pending_invite cookie (new parent signup flow)
      if (pathname === '/parents/hq') {
        const pendingInviteCookie = req.cookies.get('pending_invite');
        console.log('[MIDDLEWARE] PHQ access check:', {
          pathname,
          hasPendingInvite: !!pendingInviteCookie,
          cookieValue: pendingInviteCookie?.value
        });
        if (pendingInviteCookie) {
          // Allow access for new parent signup flow
          console.log('[MIDDLEWARE] Allowing PHQ access with pending_invite cookie');
          return NextResponse.next();
        }
      }
      
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
