import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * 🔒 Admin Route Protection Middleware
 * 
 * - Ensures only users with Admin role can access admin routes
 * - Redirects unauthorized users to /not-authorized
 * - Specifically targets the /admin route and its subroutes
 */

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;

  // If no token exists, redirect to not-authorized
  if (!token) {
    console.log('[AdminMiddleware] No auth_token found, redirecting to /not-authorized');
    return NextResponse.redirect(new URL('/not-authorized', req.url));
  }

  try {
    const payload = verifyToken(token);

    if (!payload) {
      console.error('[AdminMiddleware] Invalid or expired token');
      return NextResponse.redirect(new URL('/not-authorized', req.url));
    }

    // Check specifically for Admin role
    if (payload.role !== 'Admin') {
      console.log(`[AdminMiddleware] User with role ${payload.role} attempted to access admin route`);
      return NextResponse.redirect(new URL('/not-authorized', req.url));
    }

    // User is Admin, allow access
    return NextResponse.next();
    
  } catch (err) {
    console.error('[AdminMiddleware] Token verification error:', err);
    return NextResponse.redirect(new URL('/not-authorized', req.url));
  }
}

// Apply this middleware only to admin routes
export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
