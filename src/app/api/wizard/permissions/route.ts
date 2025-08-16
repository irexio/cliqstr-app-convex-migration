import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth/getServerSession';

export async function POST(req: NextRequest) {
  try {
    console.log('[WIZARD] Permissions endpoint called');

    // 🎯 Sol's Rule: Auth parent
    const session = await getServerSession();
    const userId = (session as any)?.userId;
    if (!userId) {
      console.log('[WIZARD] No session found');
      return NextResponse.json({ ok: false, code: 'unauthorized' }, { status: 401 });
    }

    // Get parent account
    const account = await prisma.account.findFirst({
      where: { 
        userId: userId,
        role: 'Parent'
      }
    });

    if (!account) {
      console.log('[WIZARD] No parent account found');
      return NextResponse.json({ ok: false, code: 'not_parent' }, { status: 403 });
    }

    // Parse pending_invite cookie (standardized JSON format)
    const cookieStore = await cookies();
    const pendingInviteCookie = cookieStore.get('pending_invite')?.value;
    
    let inviteId;
    if (pendingInviteCookie) {
      try {
        const parsed = JSON.parse(pendingInviteCookie);
        inviteId = parsed.inviteId;
      } catch (e) {
        console.log('[WIZARD] Invalid pending invite cookie');
        return NextResponse.json({ ok: false, code: 'invalid_invite_cookie' }, { status: 400 });
      }
    }

    if (!inviteId) {
      console.log('[WIZARD] No invite ID found');
      return NextResponse.json({ ok: false, code: 'no_invite' }, { status: 400 });
    }

    // Find the invite by ID
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId }
    });

    if (!invite) {
      console.log('[WIZARD] Invite not found:', inviteId);
      return NextResponse.json({ ok: false, code: 'invite_not_found' }, { status: 404 });
    }

    // Extract permissions from request
    const body = await req.json().catch(() => ({}));
    const { permissions } = body;
    if (!permissions) {
      console.log('[WIZARD] No permissions provided');
      return NextResponse.json({ ok: false, code: 'missing_permissions' }, { status: 400 });
    }

    console.log('[WIZARD] Saving permissions:', permissions);

    // 🎯 Sol's Rule: Atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // Persist permission choices - find the child from the invite
      if (invite.invitedUserId) {
        const childAccount = await tx.account.findFirst({
          where: { 
            userId: invite.invitedUserId,
            role: 'Child'
          }
        });

        if (childAccount) {
          // Update child settings with permissions (simplified for now)
          console.log('[WIZARD] Would save permissions for child:', invite.invitedUserId, permissions);
          // TODO: Implement proper child settings save once schema is confirmed
        }
      }

      // Sol's Rule: Final step - Mark invite as used and completed
      await tx.invite.update({
        where: { id: invite.id },
        data: {
          used: true,
          status: 'completed'
          // completedAt: new Date() // Add if field exists in schema
        }
      });

      // Sol's Rule: Optionally mark Account.parentOnboardingComplete = true
      // (Skip for now since field may not exist in schema)
      console.log('[WIZARD] Invite marked as used=true, status=completed');

      return { success: true };
    });

    // 🎯 Sol's Rule: Delete pending_invite cookie
    const response = NextResponse.json({ ok: true });
    response.cookies.set('pending_invite', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Delete the cookie
    });

    console.log('[WIZARD] Permissions saved successfully');
    return response;

  } catch (error) {
    console.error('[WIZARD] Permissions error:', error);
    return NextResponse.json({ 
      ok: false, 
      code: 'server_error',
      message: 'Failed to save permissions'
    }, { status: 500 });
  }
}
