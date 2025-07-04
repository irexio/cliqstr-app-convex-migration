import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Debug middleware to trace auth token issues
export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token');
  
  // Log cookie debug info to help diagnose the issue
  console.log(`[DEBUG] Path: ${request.nextUrl.pathname}`);
  console.log(`[DEBUG] Auth token exists: ${!!authToken}`);
  
  // Continue with the request
  return NextResponse.next();
}

// Apply middleware to auth routes
export const config = {
  matcher: ['/auth/:path*', '/api/auth/:path*', '/sign-in', '/sign-out'],
};
