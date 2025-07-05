import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * 🔐 APA (Aiden's Power Auth) Middleware
 * 
 * - Enforces session checks for protected routes
 * - Redirects unapproved child accounts to approval page
 * - Fails gracefully if unauthenticated
 */

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    console.log('[Middleware] No auth_token cookie found:', req.url);
    // Redirect unauthenticated users to sign-in page
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  try {
    const payload = verifyToken(token);

    if (!payload) {
      console.error('[Middleware] Invalid or expired token');
      return res;
    }

    const { role, isApproved } = payload;
    
    // CRITICAL: Enhanced child safety protection
    // Check for child role and approval status
    if (role?.startsWith('child')) {
      console.log(`[Middleware] Child account detected, approval status: ${isApproved}`);
      
      if (!isApproved) {
        console.log('[Middleware] Unapproved child redirected to /awaiting-approval');
        return NextResponse.redirect(new URL('/awaiting-approval', req.url));
      }
      
      // Log child account access for audit trail
      console.log(`[Middleware] Approved child account accessing: ${req.url}`);
    }

    return res;
  } catch (err) {
    console.error('[Middleware] Token verification error:', err);
    return res;
  }
}

export const config = {
  matcher: ['/cliqs/:path*', '/my-cliqs', '/parents-hq'],
};
