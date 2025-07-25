export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/auth/session-config';

/**
 * API Route for signing out users
 * Clears auth_token cookie and any other session data
 */
export async function POST(req: Request) {
  try {
    // Create response object
    const response = NextResponse.json({ 
      success: true, 
      message: 'Successfully signed out' 
    });
    
    // Destroy the encrypted session
    const session = await getIronSession<SessionData>(req, response, sessionOptions);
    await session.destroy();
    
    return response;
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to sign out' 
      },
      { status: 500 }
    );
  }
}
