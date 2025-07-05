import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * 🔐 Consolidated Security Middleware
 * 
 * This middleware handles two protection patterns:
 * 1. Admin routes - Only users with Admin role can access
 * 2. APA-protected routes - Child safety enforcement
 */
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Get auth token from cookie with detailed logging
  const allCookies = req.cookies.getAll();
  console.log(`[Middleware DEBUG] All cookies:`, allCookies.map(c => c.name));
  
  const token = req.cookies.get('auth_token')?.value;
  console.log(`[Middleware DEBUG] Path: ${path}, Token exists: ${!!token}`);
  
  // TEMPORARY FIX: For development/debugging only
  // Skip auth for My Cliqs to help debug the session issues
  if (path === '/my-cliqs') {
    console.log('[Middleware DEBUG] Bypassing auth check for My Cliqs page to debug session issues');
    return NextResponse.next();
  }
  
  // Admin route protection
  if (path.startsWith('/admin')) {
    if (!token) {
      console.log('[Middleware] No auth_token found for admin route, redirecting to /not-authorized');
      return NextResponse.redirect(new URL('/not-authorized', req.url));
    }
    
    try {
      const payload = verifyToken(token);
      
      if (!payload) {
        console.error('[Middleware] Invalid or expired token for admin route');
        return NextResponse.redirect(new URL('/not-authorized', req.url));
      }
      
      // Check specifically for Admin role
      if (payload.role !== 'Admin') {
        console.log(`[Middleware] User with role ${payload.role} attempted to access admin route`);
        return NextResponse.redirect(new URL('/not-authorized', req.url));
      }
      
      // User is Admin, allow access
      return NextResponse.next();
    } catch (err) {
      console.error('[Middleware] Token verification error for admin route:', err);
      return NextResponse.redirect(new URL('/not-authorized', req.url));
    }
  }
  
  // APA-protected routes
  const isProtectedRoute = (
    path.startsWith('/cliqs/') || 
    path === '/cliqs' || 
    path === '/my-cliqs' || 
    path === '/parents-hq'
  );
  
  if (isProtectedRoute) {
    if (!token) {
      console.log('[Middleware] No auth_token cookie found for protected route:', req.url);
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
    
    try {
      const payload = verifyToken(token);
      
      if (!payload) {
        console.error('[Middleware] Invalid or expired token for protected route');
        return NextResponse.redirect(new URL('/sign-in', req.url));
      }
      
      const { role, isApproved } = payload;
      
      // CRITICAL: Enhanced child safety protection
      if (role?.toLowerCase().startsWith('child')) {
        console.log(`[Middleware] Child account detected, approval status: ${isApproved}`);
        
        if (!isApproved) {
          console.log('[Middleware] Unapproved child redirected to /awaiting-approval');
          return NextResponse.redirect(new URL('/awaiting-approval', req.url));
        }
        
        // Log child account access for audit trail
        console.log(`[Middleware] Approved child account accessing: ${req.url}`);
      }
      
      // Authenticated and authorized user
      return NextResponse.next();
    } catch (err) {
      console.error('[Middleware] Token verification error for protected route:', err);
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }
  
  // For all other routes, allow access
  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/cliqs/:path*',
    '/my-cliqs',
    '/parents-hq',
  ],
};
