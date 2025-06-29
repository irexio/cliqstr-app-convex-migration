// 🔐 APA-HARDENED — Send Parent Approval Email
// Calls sendParentEmail() with basic validation
// Expects POST with { parentEmail, childName, isInvited?, inviteCode? }

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { sendParentEmail } from '@/lib/auth/sendParentEmail';
import { z } from 'zod';

const schema = z.object({
  parentEmail: z.string().email(),
  childName: z.string().min(1),
  isInvited: z.boolean().optional(),
  inviteCode: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { parentEmail, childName, inviteCode } = parsed.data;

    await sendParentEmail({
      to: parentEmail,
      childName,
      childId: user.id,
      inviteCode,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('❌ Error sending parent email:', err);
    return NextResponse.json({ error: 'Email failed' }, { status: 500 });
  }
}
