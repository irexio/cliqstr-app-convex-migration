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
    // NOTE: For full role enforcement, do this server-side in page logic with getCurrentUser()
    // Middleware cannot access DB, so session presence is all we can check here
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
    // NOTE: Child approval and role checks should happen in the page/server logic with getCurrentUser()
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
