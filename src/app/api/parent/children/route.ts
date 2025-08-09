export const dynamic = 'force-dynamic';

/**
 * 🔐 APA-HARDENED ROUTE: GET /api/parent/children
 *
 * Purpose:
 *   - Returns all child profiles linked to the currently authenticated parent
 *   - Used to populate the dropdown in ParentDashboard
 *
 * Auth:
 *   - Requires a logged-in parent user (validated via email)
 *   - Matches children via ParentLink table (email ↔ childId)
 *
 * Returns:
 *   - 200 OK with array of child profiles: [{ id, name?, email? }]
 *   - 401 if not authenticated
 *   - 500 on server error
 *
 * Used In:
 *   - ParentDashboard.tsx (child selector for ParentsHQPage)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { hash } from 'bcryptjs';

export async function GET() {
  try {
    const parent = await getCurrentUser();

    if (!parent?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const links = await prisma.parentLink.findMany({
      where: { email: parent.email },
    });

    const childIds = links.map((link) => link.childId);

    const children = await prisma.user.findMany({
      where: { id: { in: childIds } },
      select: {
        id: true,
        email: true,
        myProfile: {
          select: {
            username: true
          }
        }
      },
    });

    return NextResponse.json(children);
  } catch (err) {
    console.error('[GET_PARENT_CHILDREN_ERROR]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST: create a child and link to parent
export async function POST(req: Request) {
  try {
    const parent = await getCurrentUser();
    if (!parent?.id || !parent?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { username, password, code, permissions, silentMonitoring } = await req.json().catch(() => ({}));
    if (!username || !password) {
      return NextResponse.json({ ok: false, reason: 'missing_fields' }, { status: 400 });
    }

    console.log('[PARENTS_HQ][api] start', { code: code ?? null, userId: parent.id });

    const hashed = await hash(password, 10);

    try {
      const child = await prisma.$transaction(async (tx) => {
        let invite: any = null;
        if (code) {
          invite = await tx.invite.findUnique({
            where: { code },
            select: { id: true, status: true, used: true, expiresAt: true, invitedRole: true, cliqId: true },
          });

          const now = new Date();
          const expired = !!invite?.expiresAt && invite.expiresAt.getTime() < now.getTime();
          if (!invite || invite.status !== 'pending' || invite.used) {
            throw Object.assign(new Error('invalid_or_used_invite'), { code: 'invalid_or_used_invite' });
          }
          if (expired) {
            throw Object.assign(new Error('expired'), { code: 'expired' });
          }
          if ((invite.invitedRole || '').toLowerCase() !== 'child') {
            throw Object.assign(new Error('wrong_role'), { code: 'wrong_role' });
          }
        }

        // Create child user with synthetic email pattern
        const newUser = await tx.user.create({
          data: {
            email: `${username}@child.cliqstr`,
            password: hashed,
            isVerified: true, // parent-created accounts considered verified for login-less child
          },
        });

        // Minimal profile with required unique username
        const createdProfile = await tx.myProfile.create({
          data: {
            userId: newUser.id,
            username,
            // Placeholder DOB if schema requires it; adjust if real DOB is collected elsewhere
            birthdate: new Date(2008, 0, 1),
          },
        });

        // Initialize/ensure child settings (honor provided permissions)
        try {
          await tx.childSettings.upsert({
            where: { profileId: createdProfile.id },
            update: { inviteRequiresApproval: false, isSilentlyMonitored: !!silentMonitoring, ...(permissions || {}) },
            create: { profileId: createdProfile.id, inviteRequiresApproval: false, isSilentlyMonitored: !!silentMonitoring, ...(permissions || {}) },
          });
        } catch {}

        // Link to parent (store both parentId and email to match existing queries)
        await tx.parentLink.create({
          data: {
            parentId: parent.id,
            email: parent.email,
            childId: newUser.id,
            type: 'family',
          },
        });

        // If invite present, mark used/accepted and add cliq membership
        if (invite) {
          await tx.invite.update({
            where: { id: invite.id },
            data: { status: 'accepted', used: true, invitedUserId: newUser.id },
          });
          if (invite.cliqId) {
            await tx.membership.upsert({
              where: { userId_cliqId: { userId: newUser.id, cliqId: invite.cliqId } },
              update: {},
              create: { userId: newUser.id, cliqId: invite.cliqId, role: 'Member' },
            });
          }
        }

        return newUser;
      });

      console.log('[PARENT/CHILDREN/CREATE]', { parentId: parent.id, childId: child.id });
      const res = NextResponse.json({ ok: true, reason: 'ok', childId: child.id });
      res.headers.set('Cache-Control', 'no-store');
      return res;
    } catch (err: any) {
      // Handle unique constraint violation for username or email
      if (err?.code === 'P2002') {
        return NextResponse.json({ ok: false, reason: 'username_taken' }, { status: 409 });
      }
      if (err?.code === 'invalid_or_used_invite') {
        return NextResponse.json({ ok: false, reason: 'invite_consumed' }, { status: 409 });
      }
      if (err?.code === 'expired') {
        return NextResponse.json({ ok: false, reason: 'expired' }, { status: 400 });
      }
      if (err?.code === 'wrong_role') {
        return NextResponse.json({ ok: false, reason: 'wrong_role' }, { status: 400 });
      }
      throw err;
    }
  } catch (err) {
    console.error('[PARENTS_HQ][api] error', err);
    return NextResponse.json({ ok: false, reason: 'server_error' }, { status: 500 });
  }
}
