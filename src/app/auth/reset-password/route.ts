// 🔐 APA-HARDENED — Reset Password Request Handler
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendResetEmail } from '@/lib/auth/sendResetEmail';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Silent success to prevent email enumeration
      return NextResponse.json({ success: true });
    }
    
    // Generate a secure reset token
    const resetToken = crypto.randomUUID();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Token expires in 1 hour
    
    // Save token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires: expires
      }
    });
    
    // Trigger email send with email and token
    await sendResetEmail(email, resetToken);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Reset password error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
