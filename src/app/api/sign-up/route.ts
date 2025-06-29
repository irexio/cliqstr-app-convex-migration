// 🔐 APA-HARDENED — Sign-Up API Route
// Handles new user creation, inviteCode validation, age check, and optional parent approval

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { sendParentEmail } from '@/lib/auth/sendParentEmail';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  birthdate: z.string(),
  inviteCode: z.string().optional(),
  parentEmail: z.string().email().optional(),
});

function calculateAge(birthdate: string): number {
  const dob = new Date(birthdate);
  const diff = Date.now() - dob.getTime();
  return new Date(diff).getUTCFullYear() - 1970;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { email, password, birthdate, inviteCode, parentEmail } = parsed.data;
    const age = calculateAge(birthdate);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    // Optional: Validate inviteCode
    if (inviteCode) {
      const invite = await prisma.invite.findUnique({ where: { code: inviteCode } });
      if (!invite || invite.used) {
        return NextResponse.json({ error: 'Invalid or expired invite code' }, { status: 403 });
      }
    }

    const hashed = await hash(password, 10);
    const role = age < 18 ? 'child' : 'adult';
    const isApproved = role === 'adult';

    const user = await prisma.user.create({
      data: {
        email,
        password,
        profile: {
          create: {
            username: email.split('@')[0] + '-' + Math.floor(Math.random() * 10000),
            birthdate: new Date(birthdate),
            role,
            isApproved,
            password: hashed,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    if (role === 'child' && parentEmail) {
      await sendParentEmail({
        to: parentEmail,
        childName: user.profile?.username || 'Your child',
        childId: user.id,
      });
    }

    // Optionally mark invite code as used
    if (inviteCode) {
      await prisma.invite.update({
        where: { code: inviteCode },
        data: { used: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Sign-up error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
