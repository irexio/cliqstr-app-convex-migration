// 🔐 APA-HARDENED — Validate Invite Code from DB
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ valid: false, error: 'Missing invite code' }, { status: 400 });
  }

  const invite = await prisma.invite.findUnique({
    where: { code },
    select: {
      cliqId: true,
      invitedRole: true,
      inviterId: true,
      status: true,
      expiresAt: true,
    },
  });

  if (!invite) {
    return NextResponse.json({ valid: false, error: 'Invite not found' }, { status: 404 });
  }

  if (invite.status !== 'pending') {
    return NextResponse.json({ valid: false, error: 'Invite already used' }, { status: 410 });
  }

  if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
    return NextResponse.json({ valid: false, error: 'Invite expired' }, { status: 410 });
  }

  return NextResponse.json({
    valid: true,
    cliqId: invite.cliqId,
    role: invite.invitedRole,
    inviterId: invite.inviterId,
  });
}
// 🔐 APA-HARDENED — Validate Invite Code from DB
