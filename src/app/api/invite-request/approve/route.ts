// 🔐 APA-HARDENED — Approve a child invite request
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Enforce parent or adult role only
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile || profile.role === 'child') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { requestId } = await req.json();

    if (!requestId) {
      return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
    }

    const inviteRequest = await prisma.inviteRequest.findUnique({
      where: { id: requestId },
    });

    if (!inviteRequest) {
      return NextResponse.json({ error: 'Invite request not found' }, { status: 404 });
    }

    // Create approved invite
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

    // Delete the original request
    await prisma.inviteRequest.delete({
      where: { id: requestId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error approving invite request:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
