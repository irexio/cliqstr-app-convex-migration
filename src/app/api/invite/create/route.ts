// src/app/api/invite/create/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inviter = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
      },
    });

    if (!inviter?.profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { cliqId, inviteeEmail, invitedRole } = body;

    if (!cliqId || !inviteeEmail || !invitedRole) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const isChild = inviter.profile.role === 'child';

    if (isChild) {
      // 🛑 Save as Invite Request (awaiting parent approval)
      await prisma.inviteRequest.create({
        data: {
          cliqId,
          inviterId: user.id,
          inviteeEmail,
          invitedRole,
          status: 'pending',
        },
      });

      return NextResponse.json({ success: true, type: 'request' });
    }

    // ✅ Auto-create approved invite for adults
    await prisma.invite.create({
      data: {
        code: nanoid(10),
        cliqId,
        inviterId: user.id,
        inviteeEmail,
        invitedRole,
        status: 'pending',
        isApproved: true,
      },
    });

    return NextResponse.json({ success: true, type: 'invite' });
  } catch (err) {
    console.error('Error creating invite:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
