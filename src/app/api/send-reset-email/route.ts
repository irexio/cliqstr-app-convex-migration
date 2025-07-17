// 🔐 APA-HARDENED EMAIL UTILITY — Sends Reset Password Link via Resend

import { NextResponse } from 'next/server';
import { sendResetEmail } from '@/lib/auth/sendResetEmail';

export const dynamic = 'force-dynamic';

/**
 * API route handler for sending password reset emails
 * Uses the consolidated sendResetEmail helper from lib/auth
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }
    
    // Use the consolidated helper function that handles everything
    console.log('📣 Route handler reached, about to call sendResetEmail...');
    const result = await sendResetEmail(email);
    
    if (!result.success) {
      console.error('💣 Reset email failed:', result.error);
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Failed to send reset email' 
      }, { status: 500 });
    }
    
    // Always return success (even if user doesn't exist) for security
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('💥 Reset email exception:', err);
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}
