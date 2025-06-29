// 🔐 APA-HARDENED — Reset Password Request Handler
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendResetEmail } from '@/lib/auth/sendResetEmail';

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

    // Trigger email send (utility function in lib/auth)
    await sendResetEmail(user);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Reset password error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
