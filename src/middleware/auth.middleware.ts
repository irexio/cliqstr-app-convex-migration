import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * APA (Aiden's Power Auth) Authentication Middleware
 * 
 * This middleware provides COPAA-compliant authentication for Cliqstr:
 * - Handles child/parent account relationships
 * - Enforces parental approval requirements
 * - Manages role-based access controls
 * - Redirects unapproved child accounts to the approval waiting page
 * 
 * Part of the ghost-type solution for Next.js 15.x parameter handling
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Read your custom JWT from a cookie (e.g., 'auth_token')
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    // No token = not logged in
    return res;
  }

  try {
    // Using proper JWT verification with signature check
    const payload = verifyToken(token);
    
    // If token verification fails, continue without redirection
    if (!payload) {
      console.error('Invalid or expired token');
      return res;
    }
    
    const { role, isApproved } = payload;

    if (role?.startsWith('child') && !isApproved) {
      return NextResponse.redirect(new URL('/awaiting-approval', req.url));
    }

    return res;
  } catch (err) {
    console.error('Invalid token in middleware:', err);
    return res;
  }
}

export const config = {
  matcher: ['/cliqs/:path*', '/my-cliqs', '/parents-hq'],
};
