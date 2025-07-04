/**
 * Invite Code Validation API
 * 
 * Purpose:
 * - Validates invite codes
 * - Returns invite metadata for rendering the join page
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Extract the invite code from the query params
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return NextResponse.json({ valid: false, message: 'No invite code provided' }, { status: 400 });
    }

    // Look up the invite code
    const invite = await prisma.invite.findUnique({
      where: { code },
      include: {
        inviter: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json({ valid: false, message: 'Invalid invite code' }, { status: 404 });
    }

    // Check if invite is expired
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, message: 'This invite code has expired' }, { status: 400 });
    }

    // Check if already used and max uses
    if (invite.used && invite.maxUses <= 1) {
      return NextResponse.json({ valid: false, message: 'This invite code has already been used' }, { status: 400 });
    }

    // Return invite details (safe version without sensitive data)
    return NextResponse.json({
      valid: true,
      inviteRole: invite.invitedRole,
      cliqId: invite.cliqId,
      inviterEmail: invite.inviter.email,
      message: invite.message,
    });
  } catch (error) {
    console.error('Error validating invite code:', error);
    return NextResponse.json({ valid: false, message: 'Error validating invite code' }, { status: 500 });
  }
}
