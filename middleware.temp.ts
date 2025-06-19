import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ✅ Custom auth middleware — no Supabase, no Clerk, no drama
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Read your custom JWT from a cookie (e.g., 'auth_token')
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    // No token = not logged in
    return res;
  }

  try {
    // You'll replace this with your real JWT verification later
    const payload = JSON.parse(atob(token.split('.')[1])); // ⚠️ TEMPORARY — replace with real JWT lib!

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
