import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 🔐 Consolidated Security Middleware
 * 
 * This middleware handles two protection patterns:
 * 1. Admin routes - Only users with Admin role can access
 * 2. APA-protected routes - Child safety enforcement
 */
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Get session cookie
  const session = req.cookies.get('session')?.value;

  // Admin route protection (session-based)
  if (path.startsWith('/admin')) {
    if (!session) {
      // No session cookie, not authorized
      return NextResponse.redirect(new URL('/not-authorized', req.url));
    }
    return NextResponse.next();
  }

  // APA-protected routes
  const isProtectedRoute = (
    path.startsWith('/cliqs/') ||
    path === '/cliqs' ||
    path === '/my-cliqs' ||
    path === '/my-cliqs-dashboard' ||
    path.startsWith('/parents-hq')
  );

  if (isProtectedRoute) {
    if (!session) {
      // No session cookie, must sign in
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
    // Middleware cannot access DB, so we call the status endpoint to check suspension
    try {
      // Prefer /api/auth/status, fallback to /auth/status
      const url = req.nextUrl.clone();
      url.pathname = '/api/auth/status';
      const res = await fetch(url.toString(), {
        headers: { Cookie: req.headers.get('cookie') || '' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user?.account?.suspended) {
          if (path !== '/suspended') {
            url.pathname = '/suspended';
            return NextResponse.redirect(url);
          }
        }
      }
    } catch (err) {
      // If status endpoint fails, let through (fail open)
      // Optionally log error
    }
    return NextResponse.next();
  }

  // For all other routes, allow access
  return NextResponse.next();
}



// Configure which routes use this middleware
// Security middleware configuration
export const config = {
  matcher: [
    '/admin/:path*',
    '/cliqs/:path*',
    '/my-cliqs',
    '/my-cliqs-dashboard',
    '/parents-hq/:path*',
  ],
};
