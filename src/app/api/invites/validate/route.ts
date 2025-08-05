export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeInviteCode } from '@/lib/auth/generateInviteCode';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    console.log('[INVITE_VALIDATE] Raw code from URL:', code);

    if (!code) {
      return NextResponse.json({ valid: false, reason: 'missing_code' }, { status: 400 });
    }

    const normalizedCode = normalizeInviteCode(code);
    console.log('[INVITE_VALIDATE] Normalized code:', normalizedCode);

    const invite = await prisma.invite.findUnique({
      where: { code: normalizedCode },
      include: {
        inviter: {
          select: {
            id: true,
            email: true,
          },
        },
        cliq: {
          select: { name: true }
        }
      },
    });

    console.log('[INVITE_VALIDATE] Invite found:', !!invite);
    if (invite) {
      console.log('[INVITE_VALIDATE] Invite details:', {
        id: invite.id,
        code: invite.code,
        used: invite.used,
        expiresAt: invite.expiresAt,
        invitedRole: invite.invitedRole
      });
    }

    if (!invite) {
      console.log('[INVITE_VALIDATE] No invite found for code:', normalizedCode);
      return NextResponse.json({ valid: false, reason: 'not_found' }, { status: 404 });
    }

    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, reason: 'expired' }, { status: 410 });
    }

    if (invite.used && invite.maxUses <= 1) {
      return NextResponse.json({ valid: false, reason: 'used' }, { status: 409 });
    }

    return NextResponse.json({
      valid: true,
      invite: {
        friendFirstName: invite.friendFirstName,
        cliqName: invite.cliq?.name || 'Unknown',
        inviteRole: invite.invitedRole,
        cliqId: invite.cliqId,
        inviterEmail: invite.inviter.email,
      }
    });
  } catch (error) {
    console.error('Error validating invite code:', error);
    return NextResponse.json({ valid: false, reason: 'server_error' }, { status: 500 });
  }
}
