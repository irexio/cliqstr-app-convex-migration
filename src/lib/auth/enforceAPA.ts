/**
 * 🔐 APA-SAFE UTILITY: enforceAPA
 *
 * Purpose:
 *   - Enforces APA (Aiden's Power Auth) requirements for user authentication
 *   - Validates user role and approval status
 *   - Prevents unapproved children from accessing protected resources
 *
 * Notes:
 *   - Used across authentication flows (sign-up, sign-in, password reset)
 *   - Returns appropriate error responses for unauthorized access
 *   - No tokens or client-side storage used
 */

import { NextResponse } from 'next/server';

type User = {
  id: string;
  email?: string;
  account?: {
    role?: string;
    isApproved?: boolean;
  };
};

/**
 * Enforces APA requirements for user authentication
 * @param user The user object to validate
 * @returns NextResponse with error if validation fails, null if validation passes
 */
export function enforceAPA(user: User | null): NextResponse | null {
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is an unapproved child - APA uses Account data ONLY
  const role = user.account?.role;
  const isApproved = user.account?.isApproved ?? false;

  if (role?.toLowerCase() === 'child' && !isApproved) {
    console.log('🚫 APA enforcement: Child not approved', { userId: user.id, email: user.email });
    return NextResponse.redirect(new URL('/awaiting-approval', process.env.NEXT_PUBLIC_SITE_URL || 'https://cliqstr.com'));
  }

  return null; // Validation passed
}

/**
 * Clears any authentication tokens from cookies
 * @param headers Headers object to modify
 */
export function clearAuthTokens(headers: Headers): void {
  // Clear any potential auth tokens
  headers.append('Set-Cookie', 'resetToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  headers.append('Set-Cookie', 'authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
}
