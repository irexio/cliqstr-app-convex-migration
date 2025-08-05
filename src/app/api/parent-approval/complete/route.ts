import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeInviteCode } from '@/lib/auth/generateInviteCode';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/auth/session-config';

export const dynamic = 'force-dynamic';

const approvalSchema = z.object({
  inviteCode: z.string().min(1),
  username: z.string().min(3),
  password: z.string().min(6),
  redAlertAccepted: z.literal(true),
  silentMonitoring: z.boolean(),
  permissions: z.object({
    canPost: z.boolean(),
    canComment: z.boolean(),
    canReact: z.boolean(),
    canViewProfiles: z.boolean(),
    canReceiveInvites: z.boolean(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = approvalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { inviteCode, username, password, redAlertAccepted, silentMonitoring, permissions } = parsed.data;
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: 'Must be signed in' }, { status: 401 });
    const parentEmail = currentUser.email;

    const normalizedCode = normalizeInviteCode(inviteCode);
    const invite = await prisma.invite.findUnique({
      where: { code: normalizedCode },
      include: {
        cliq: { select: { name: true } },
        inviter: { select: { myProfile: { select: { firstName: true, lastName: true } } } },
      },
    });
    if (!invite) return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });

    let childUser = null;
    if (invite.inviteType === 'parent-approval') {
      // Create child account from invite note
      let firstName = invite.friendFirstName || 'Child';
      let lastName = '';
      let birthdate = new Date();
      if (invite.inviteNote) {
        const match = invite.inviteNote.match(/Child approval request for (.*?) (.*?), age (\d+)/);
        if (match) {
          firstName = match[1];
          lastName = match[2];
          birthdate = new Date(new Date().getFullYear() - parseInt(match[3]), new Date().getMonth(), new Date().getDate());
        }
      }
      const hashedTemp = await hash(Math.random().toString(36).slice(-8), 10);
      childUser = await prisma.user.create({
        data: {
          email: `child-${normalizedCode}@pending.cliqstr.com`,
          password: hashedTemp,
        },
      });
      await prisma.myProfile.create({
        data: {
          userId: childUser.id,
          firstName,
          lastName,
          birthdate,
          username: `child-${childUser.id}`,
        },
      });
      await prisma.account.create({
        data: {
          userId: childUser.id,
          birthdate,
          role: 'Child',
          isApproved: false,
        },
      });
    } else {
      childUser = await prisma.user.findUnique({
        where: { id: invite.invitedUserId || undefined },
        include: { account: true },
      });
      if (!childUser) return NextResponse.json({ error: 'Child account not found' }, { status: 404 });
    }

    // Create or update parent
    let parentUser = await prisma.user.findUnique({ where: { email: parentEmail }, include: { account: true } });
    if (!parentUser) {
      const hashed = await hash(password, 10);
      parentUser = await prisma.user.create({
        data: {
          email: parentEmail,
          password: hashed,
          isVerified: true,
        },
        include: { account: true },
      });
      await prisma.myProfile.create({
        data: {
          userId: parentUser.id,
          firstName: 'Parent',
          birthdate: new Date(),
          username: `parent-${parentUser.id}`,
        },
      });
      await prisma.account.create({
        data: {
          userId: parentUser.id,
          birthdate: new Date('1985-01-01'),
          role: 'Parent',
          isApproved: true,
          plan: 'test',
        },
      });
    } else {
      // Parent user already exists - update role if needed
      const currentRole = parentUser.account?.role;
      
      if (currentRole !== 'Parent') {
        console.log('[PARENT_APPROVAL] Upgrading user from Adult to Parent role:', {
          email: parentEmail,
          currentRole,
          newRole: 'Parent'
        });
        await prisma.account.update({ 
          where: { userId: parentUser.id }, 
          data: { role: 'Parent' } 
        });
      } else {
        console.log('[PARENT_APPROVAL] Parent user already has correct role:', {
          email: parentEmail,
          role: currentRole
        });
      }
      
      if (!parentUser.isVerified) {
        console.log('[PARENT_APPROVAL] Verifying parent user email');
        await prisma.user.update({ 
          where: { id: parentUser.id }, 
          data: { isVerified: true } 
        });
      }
    }

    await prisma.parentLink.create({
      data: {
        parentId: parentUser.id,
        email: parentUser.email,
        childId: childUser.id,
        type: 'invited',
        inviteContext: JSON.stringify({
          inviteCode: normalizedCode,
          cliqName: invite.cliq?.name || '',
          inviterName: `${invite.inviter?.myProfile?.firstName || ''} ${invite.inviter?.myProfile?.lastName || ''}`.trim(),
          redAlertAccepted,
          silentMonitoring,
        }),
      },
    });

    const childProfile = await prisma.myProfile.findUnique({
      where: { userId: childUser.id },
      select: { id: true },
    });

    if (childProfile) {
      await prisma.childSettings.upsert({
        where: { profileId: childProfile.id },
        update: {
          canJoinPublicCliqs: permissions.canViewProfiles,
          canSendInvites: permissions.canReceiveInvites,
          isSilentlyMonitored: silentMonitoring,
          canPostImages: permissions.canPost,
          inviteRequiresApproval: true,
        },
        create: {
          profileId: childProfile.id,
          canJoinPublicCliqs: permissions.canViewProfiles,
          canSendInvites: permissions.canReceiveInvites,
          isSilentlyMonitored: silentMonitoring,
          canPostImages: permissions.canPost,
          inviteRequiresApproval: true,
        },
      });
    }

    await prisma.parentAuditLog.create({
      data: {
        parentId: parentUser.id,
        childId: childUser.id,
        action: 'accepted_red_alert',
        newValue: 'true',
      },
    });

    await prisma.user.update({
      where: { id: childUser.id },
      data: { password: await hash(password, 10) },
    });

    await prisma.myProfile.update({
      where: { userId: childUser.id },
      data: { username },
    });

    await prisma.account.update({
      where: { userId: childUser.id },
      data: {
        isApproved: true,
        plan: 'test',
      },
    });

    await prisma.invite.update({
      where: { code: normalizedCode },
      data: {
        used: true,
        status: 'accepted',
        invitedUserId: childUser.id,
      },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Parent approval completed successfully',
      parentId: parentUser.id,
      childId: childUser.id,
      redirectUrl: '/parents/hq',
    });

    const session = await getIronSession<SessionData>(req, response, sessionOptions);
    session.userId = parentUser.id;
    session.createdAt = Date.now();
    await session.save();

    return response;
  } catch (error) {
    console.error('[PARENT_APPROVAL_COMPLETE_ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to complete parent approval: ${errorMessage}` }, { status: 500 });
  }
}
