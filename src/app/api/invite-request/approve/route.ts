// src/app/api/invite-request/approve/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
    }

    const inviteRequest = await prisma.inviteRequest.findUnique({
      where: { id: requestId },
    });

    if (!inviteRequest) {
      return NextResponse.json({ error: 'Invite request not found' }, { status: 404 });
    }

    // Create Invite
    await prisma.invite.create({
      data: {
        code: nanoid(10),
        cliqId: inviteRequest.cliqId,
        invitedRole: inviteRequest.invitedRole,
        inviteeEmail: inviteRequest.inviteeEmail,
        inviterId: inviteRequest.inviterId,
        status: 'pending',
        isApproved: true,
      },
    });

    // Delete the invite request after processing
    await prisma.inviteRequest.delete({
      where: { id: requestId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving invite request:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
