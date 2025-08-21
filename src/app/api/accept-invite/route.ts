import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

type AcceptBody = { code?: string; token?: string; joinCode?: string };

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const userId = user.id;

    const body = (await req.json().catch(() => ({}))) as AcceptBody;
    const code = body?.code?.trim();
    const token = body?.token?.trim();
    const joinCode = body?.joinCode?.trim();
    if (!code && !token && !joinCode) {
      return NextResponse.json({ ok: false, reason: 'missing_code_or_token' }, { status: 400 });
    }

    // Fetch invite by priority: token -> joinCode -> legacy code
    const invite = token
      ? await prisma.invite.findUnique({
          where: { token },
          select: {
            id: true,
            status: true,
            used: true,
            expiresAt: true,
            invitedRole: true,
            cliqId: true,
            inviterId: true,
            inviteeEmail: true,
            trustedAdultContact: true,
            invitedUserId: true,
          },
        })
      : joinCode
      ? await prisma.invite.findUnique({
          where: { joinCode },
          select: {
            id: true,
            status: true,
            used: true,
            expiresAt: true,
            invitedRole: true,
            cliqId: true,
            inviterId: true,
            inviteeEmail: true,
            trustedAdultContact: true,
            invitedUserId: true,
          },
        })
      : await prisma.invite.findUnique({
          where: { code: code! },
          select: {
            id: true,
            status: true,
            used: true,
            expiresAt: true,
            invitedRole: true,
            cliqId: true,
            inviterId: true,
            inviteeEmail: true,
            trustedAdultContact: true,
            invitedUserId: true,
          },
        });

    const now = new Date();
    const expired = !!invite?.expiresAt && invite.expiresAt.getTime() < now.getTime();

    // Basic trace
    console.log('[ACCEPT/INVITE/CHECK]', {
      code: code || '(none)',
      token: token || '(none)',
      joinCode: joinCode || '(none)',
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

    // Child invites: redirect to Parents HQ to complete APA flow
    if (role === 'child') {
      console.log('[INVITE/ACCEPT][server]', { code, token, joinCode, role, outcome: 'child_redirect_parents_hq' });
      const inviteParam = token ?? joinCode ?? code ?? '';
      const url = new URL(`/parents/hq?inviteCode=${encodeURIComponent(inviteParam)}`, req.url);
      return NextResponse.redirect(url);
    }
    
    // Adult invites continue below
    if (role !== 'adult') {
      return NextResponse.json({ ok: false, reason: 'wrong_role' }, { status: 400 });
    }

    // If already used/accepted, but the user is already a member, treat as idempotent success
    if ((invite.used || invite.status !== 'pending') && invite.cliqId) {
      const existing = await prisma.membership.findUnique({
        where: { userId_cliqId: { userId, cliqId: invite.cliqId } },
      });
      if (existing) {
        console.log('[ACCEPT/INVITE] idempotent success (already member)', { code, userId, cliqId: invite.cliqId });
        return NextResponse.json({ ok: true });
      }
      // If invite was consumed by someone else, fail
      if (invite.used && invite.invitedUserId && invite.invitedUserId !== userId) {
        return NextResponse.json({ ok: false, reason: 'invite_already_used' }, { status: 409 });
      }
      // If status not pending but unused edge case, continue to upsert membership below
    }

    if (expired) {
      return NextResponse.json({ ok: false, reason: 'expired' }, { status: 400 });
    }

    // At this point: role=adult, not expired. Proceed in a transaction.
    if (!invite.cliqId) {
      return NextResponse.json({ ok: false, reason: 'missing_cliq' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // 1) Upsert membership (idempotent via composite unique)
      const membership = await tx.membership.upsert({
        where: { userId_cliqId: { userId, cliqId: invite.cliqId! } },
        create: { userId, cliqId: invite.cliqId!, role: 'Member' },
        update: {}, // already a member → no change
      });

      // 2) Mark invite accepted/used + bind to this user (idempotent-safe)
      await tx.invite.update({
        where: { id: invite.id },
        data: {
          status: 'accepted',
          used: true,
          acceptedAt: new Date(),
          invitedUserId: userId,
        },
      });

      // 3) Mark the user's email verified (safe even if already true)
      await tx.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });

      return { membershipId: membership.id };
    });

    console.log('[INVITE/ACCEPT][server]', {
      code: code || '(none)',
      token: token || '(none)',
      joinCode: joinCode || '(none)',
      role,
      outcome: 'adult_join',
      userId,
      cliqId: invite.cliqId,
      membershipId: result.membershipId,
    });

    // If this was submitted via a browser navigation (e.g., form submit without JSON),
    // perform a server-side redirect to Parents HQ to satisfy APA redirect requirements.
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Adults go to dashboard (or cliq page). Using dashboard as canonical.
      return NextResponse.redirect(new URL('/my-cliqs-dashboard', req.url));
    }

    const res = NextResponse.json({ ok: true });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (err) {
    console.error('[ACCEPT/INVITE] error', err);
    return NextResponse.json({ ok: false, reason: 'server_error' }, { status: 500 });
  }
}
