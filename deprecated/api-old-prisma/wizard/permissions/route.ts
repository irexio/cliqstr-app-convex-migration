import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth/getServerSession';

export async function POST(req: NextRequest) {
  try {
    console.log('[WIZARD] Permissions endpoint called');

    // 🎯 Sol's Rule: Auth parent
    const session = await getServerSession();
    // getServerSession() returns the user object from getCurrentUser(), which has `id`, not `userId`
    const userId = (session as any)?.id || (session as any)?.userId;
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

    // Parse pending_invite cookie (support Base64-URL encoded JSON and legacy JSON)
    const cookieStore = await cookies();
    const pendingInviteCookie = cookieStore.get('pending_invite')?.value;
    let inviteId;
    if (pendingInviteCookie) {
      try {
        // Try Base64-URL encoded JSON first
        try {
          const decodedJson = Buffer.from(pendingInviteCookie, 'base64url').toString('utf-8');
          const parsed = JSON.parse(decodedJson);
          inviteId = parsed.inviteId;
          console.log('[WIZARD] Parsed inviteId from Base64-URL cookie:', inviteId);
        } catch (base64Err) {
          // Fallback to legacy JSON (possibly URI encoded)
          const parsed = JSON.parse(decodeURIComponent(pendingInviteCookie));
          inviteId = parsed.inviteId;
          console.log('[WIZARD] Parsed inviteId from legacy JSON cookie:', inviteId);
        }
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
    const { permissions } = body as any;
    if (!permissions) {
      console.log('[WIZARD] No permissions provided');
      return NextResponse.json({ ok: false, code: 'missing_permissions' }, { status: 400 });
    }

    // Enforce critical monitoring acceptance
    if (permissions.isSilentlyMonitored === false) {
      console.log('[WIZARD] Monitoring must be enabled');
      return NextResponse.json({ ok: false, code: 'require_monitoring', message: 'Silent monitoring must remain enabled to continue.' }, { status: 400 });
    }

    console.log('[WIZARD] Saving permissions:', permissions);

    // 🎯 Sol's Rule: Atomic transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Persist permission choices - find the child from the invite
      if (invite.invitedUserId) {
        const childAccount = await tx.account.findFirst({
          where: {
            userId: invite.invitedUserId,
            role: 'Child'
          }
        });

        if (childAccount) {
          // Find child's profile
          const childProfile = await tx.myProfile.findFirst({
            where: { userId: invite.invitedUserId }
          });

          if (childProfile) {
            // Map incoming permission flags to ChildSettings schema
            const settingsUpdate: any = {
              // Cliq creation/joining controls
              canCreatePublicCliqs: !!permissions.canCreatePublicCliqs,
              canJoinPublicCliqs: !!permissions.canJoinPublicCliqs,
              // There is no explicit canCreatePrivateCliqs; map to canCreateCliqs
              canCreateCliqs: !!(permissions.canCreatePrivateCliqs ?? permissions.canCreateCliqs),
              // Invites and other simple flags if provided (no-ops if undefined)
              canSendInvites: permissions.canSendInvites === undefined ? undefined : !!permissions.canSendInvites,
              canInviteChildren: permissions.canInviteChildren === undefined ? undefined : !!permissions.canInviteChildren,
              canInviteAdults: permissions.canInviteAdults === undefined ? undefined : !!permissions.canInviteAdults,
              // Content controls
              canAccessGames: permissions.canAccessGames === undefined ? undefined : !!permissions.canAccessGames,
              canPostImages: permissions.canPostImages === undefined ? undefined : !!permissions.canPostImages,
              canShareYouTube: permissions.canShareYouTube === undefined ? undefined : !!permissions.canShareYouTube,
              // Monitoring
              isSilentlyMonitored: permissions.isSilentlyMonitored === undefined ? true : !!permissions.isSilentlyMonitored,
              // Always require approval by default unless explicitly disabled earlier in flow
              inviteRequiresApproval: permissions.inviteRequiresApproval === undefined ? true : !!permissions.inviteRequiresApproval,
            };

            // Remove undefined keys so Prisma doesn't overwrite with null
            Object.keys(settingsUpdate).forEach((k) => settingsUpdate[k] === undefined && delete settingsUpdate[k]);

            await tx.childSettings.upsert({
              where: { profileId: childProfile.id },
              update: settingsUpdate,
              create: {
                profileId: childProfile.id,
                ...settingsUpdate,
              }
            });

            console.log('[WIZARD] Saved child settings for child user:', invite.invitedUserId);
          } else {
            console.warn('[WIZARD] Child profile not found for invited user:', invite.invitedUserId);
          }
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

      // Sol's Rule: Optionally mark Account.parentOnboardingComplete = true (not in schema currently)
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
