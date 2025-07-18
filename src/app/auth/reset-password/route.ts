// 🔐 APA-HARDENED — Reset Password Request Handler
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendResetEmail } from '@/lib/auth/sendResetEmail';

export const dynamic = 'force-dynamic';

const schema = z.object({
  email: z.string().email(),
});

/**
 * API route handler for initiating password reset
 * Uses the consolidated sendResetEmail helper from lib/auth
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const { email } = parsed.data;
    
    // Use the consolidated helper function that handles everything
    // This will check if user exists, generate token, and send email
    // Updated to match new function signature (single parameter)
    const result = await sendResetEmail(email);
    
    // Always return success (even if user doesn't exist) for security
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Reset password error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
