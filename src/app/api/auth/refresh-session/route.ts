// 🔐 APA-COMPLIANT — Session refresh endpoint
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

/**
 * Endpoint to refresh the server-side session data
 * This is used after plan selection to ensure the updated plan is reflected in the session
 */
export async function POST() {
  try {
    // Re-fetch the current user to get the latest data
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Return the refreshed user data
    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        plan: user.account?.plan,
        role: user.account?.role,
        approved: user.account?.isApproved,
      }
    });
  } catch (error) {
    console.error('[SESSION_REFRESH_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
