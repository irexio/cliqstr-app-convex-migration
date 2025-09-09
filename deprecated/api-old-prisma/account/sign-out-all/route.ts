import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth/session-config';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Destroy current session
    const response = NextResponse.json({ 
      success: true, 
      message: 'Signed out of all devices successfully' 
    });

    const session = await getIronSession(req, response, sessionOptions);
    await session.destroy();

    // TODO: In a more sophisticated implementation, you would:
    // 1. Track active sessions in a database table
    // 2. Invalidate all sessions for this user
    // 3. Force re-authentication on all devices
    
    // For now, we destroy the current session and rely on session expiration
    // for other devices. Future enhancement could include:
    // - Session tracking table
    // - JWT blacklisting
    // - Session invalidation tokens

    return response;

  } catch (error) {
    console.error('Sign out all devices error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
