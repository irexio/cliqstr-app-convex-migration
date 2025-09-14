import { NextResponse, NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth/session-config';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/clear-session
 * 
 * Clears the current user session (logs out the user)
 * Used when a parent clicks an approval link to ensure they start fresh
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession(req, NextResponse.next(), sessionOptions);
    
    // Clear the session
    session.destroy();
    
    console.log('[CLEAR-SESSION] Session cleared successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Session cleared successfully'
    });

  } catch (error) {
    console.error('[CLEAR-SESSION] Error clearing session:', error);
    return NextResponse.json({ 
      error: 'Failed to clear session' 
    }, { status: 500 });
  }
}
