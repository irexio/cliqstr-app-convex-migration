// src/app/api/sign-up/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      username,
      password,
      birthdate,
      role: invitedRole,
      inviteCode,
      email,
    } = body;

    if (!username || !password || !birthdate || !invitedRole || !inviteCode || !email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const invite = await prisma.invite.findUnique({
      where: { code: inviteCode },
    });

    if (!invite || invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invalid invite' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const profile = await prisma.profile.create({
      data: {
        username,
        password: hashedPassword,
        birthdate: new Date(birthdate),
        role: invitedRole,
        isApproved: true,
        stripeStatus: 'free',
        ageGroup: 'child',
        userId: user.id,
      },
    });

    await prisma.invite.update({
      where: { code: inviteCode },
      data: { status: 'used' },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error('Sign-up error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
