// 🔐 APA-HARDENED ROUTE: POST /api/parent/approval-complete
// Finalizes child approval atomically from Parents HQ

import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Auth: require logged-in parent
    const parent = await getCurrentUser();
    if (!parent?.id || !parent?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json().catch(() => ({} as any));
    const inviteCode: string | undefined = body.inviteCode?.trim();
    const childUsername: string | undefined = body.childUsername?.trim();
    const childPassword: string | undefined = body.childPassword?.trim();
    const permissions: Record<string, any> = body.permissions || {};

    if (!inviteCode) {
      return NextResponse.json({ ok: false, reason: 'missing_invite_code' }, { status: 400 });
    }

    // Load invite
    const invite = await prisma.invite.findUnique({
      where: { code: inviteCode },
      select: {
        id: true,
        status: true,
        used: true,
        expiresAt: true,
        invitedRole: true,
        cliqId: true,
        invitedUserId: true,
      },
    });

    const now = new Date();
    const expired = !!invite?.expiresAt && invite.expiresAt.getTime() < now.getTime();

    console.log('[PARENT/APPROVE/CHECK]', {
      inviteCode,
      found: !!invite,
      status: invite?.status,
      used: invite?.used,
      expired,
      role: invite?.invitedRole,
      cliqId: invite?.cliqId,
    });

    if (!invite) {
      return NextResponse.json({ ok: false, reason: 'not_found' }, { status: 404 });
    }

    const role = (invite.invitedRole || '').toLowerCase();
    if (role !== 'child') {
      return NextResponse.json({ ok: false, reason: 'wrong_role' }, { status: 400 });
    }

    if (expired) {
      return NextResponse.json({ ok: false, reason: 'expired' }, { status: 400 });
    }

    // Idempotent path: already used and bound to a child
    if ((invite.used || invite.status !== 'pending') && invite.invitedUserId) {
      const existingLink = await prisma.parentLink.findFirst({
        where: { parentId: parent.id, childId: invite.invitedUserId },
      });
      if (!existingLink) {
        await prisma.parentLink.create({
          data: { parentId: parent.id, childId: invite.invitedUserId, email: parent.email, type: 'family' },
        });
      }
      return NextResponse.json({ ok: true, childId: invite.invitedUserId }, { headers: { 'Cache-Control': 'no-store' } });
    }

    // Transaction: create/approve/link
    const result = await prisma.$transaction(async (tx) => {
      // 1) Create child account if credentials provided
      if (!childUsername || !childPassword) {
        // For this flow, credentials are required to create the child account
        throw Object.assign(new Error('missing_child_credentials'), { code: 'missing_child_credentials' });
      }

      // Ensure username is unique at profile level
      const existingProfile = await tx.myProfile.findUnique({
        where: { username: childUsername },
        select: { id: true, userId: true },
      });
      if (existingProfile) {
        throw Object.assign(new Error('username_taken'), { code: 'username_taken' });
      }

      const pwd = await hash(childPassword, 10);

      const childUser = await tx.user.create({
        data: {
          email: `${childUsername}@child.cliqstr`,
          password: pwd,
          isVerified: true,
        },
        select: { id: true },
      });

      await tx.myProfile.create({
        data: {
          userId: childUser.id,
          username: childUsername,
          birthdate: new Date(2008, 0, 1),
        },
      });

      // Initialize/ensure settings and mark approved
      const profile = await tx.myProfile.findUnique({ where: { userId: childUser.id }, select: { id: true } });
      if (profile?.id) {
        await tx.childSettings.upsert({
          where: { profileId: profile.id },
          update: { inviteRequiresApproval: false, ...permissions },
          create: { profileId: profile.id, inviteRequiresApproval: false, ...permissions },
        });
      }

      // 2) Link parent ↔ child (idempotent)
      const link = await tx.parentLink.findFirst({ where: { parentId: parent.id, childId: childUser.id } });
      if (!link) {
        await tx.parentLink.create({ data: { parentId: parent.id, childId: childUser.id, email: parent.email, type: 'family' } });
      }

      // 3) Mark invite as accepted/used and bind to child
      await tx.invite.update({
        where: { code: inviteCode },
        data: { status: 'accepted', used: true, invitedUserId: childUser.id },
      });

      // 4) Optional membership add
      if (invite.cliqId) {
        const existingMember = await tx.membership.findFirst({
          where: { userId: childUser.id, cliqId: invite.cliqId },
        });
        if (!existingMember) {
          await tx.membership.create({ data: { userId: childUser.id, cliqId: invite.cliqId, role: 'Member' } });
        }
      }

      return { childId: childUser.id };
    });

    const res = NextResponse.json({ ok: true, childId: result.childId });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (err: any) {
    if (err?.code === 'username_taken') {
      return NextResponse.json({ ok: false, reason: 'username_taken' }, { status: 409 });
    }
    if (err?.code === 'missing_child_credentials') {
      return NextResponse.json({ ok: false, reason: 'missing_child_credentials' }, { status: 400 });
    }
    console.error('[PARENT/APPROVE] error', err);
    return NextResponse.json({ ok: false, reason: 'server_error' }, { status: 500 });
  }
}
