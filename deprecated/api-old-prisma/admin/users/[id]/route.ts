import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export const dynamic = 'force-dynamic';

function requireAdmin(user: any) {
  const role = user?.account?.role || user?.role;
  return !!user?.id && (role === 'Admin' || role === 'ADMIN');
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const admin = await getCurrentUser();
    if (!requireAdmin(admin)) {
      return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });
    }

    const { action, targetRole } = await req.json().catch(() => ({}));
    if (!action) return NextResponse.json({ ok: false, reason: 'missing_action' }, { status: 400 });

    const userId = id;
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, account: { select: { role: true, isApproved: true, suspended: true } } },
    });
    if (!target) return NextResponse.json({ ok: false, reason: 'not_found' }, { status: 404 });

    if (action === 'approve') {
      await prisma.user.update({ where: { id: userId }, data: { account: { update: { isApproved: true } } } });
      await prisma.userActivityLog.create({
        data: {
          userId: target.id,
          event: 'admin_approve_user',
          detail: JSON.stringify({ by: admin?.id, byEmail: admin?.email, wasApproved: target.account?.isApproved, nowApproved: true }),
        },
      });
      return NextResponse.json({ ok: true, reason: 'approved' });
    }

    if (action === 'deactivate') {
      await prisma.user.update({ where: { id: userId }, data: { account: { update: { isApproved: false } } } });
      await prisma.userActivityLog.create({
        data: {
          userId: target.id,
          event: 'admin_deactivate_user',
          detail: JSON.stringify({ by: admin?.id, byEmail: admin?.email, wasApproved: target.account?.isApproved, nowApproved: false }),
        },
      });
      return NextResponse.json({ ok: true, reason: 'deactivated' });
    }

    if (action === 'suspend') {
      await prisma.user.update({ where: { id: userId }, data: { account: { update: { suspended: true } } } });
      await prisma.userActivityLog.create({
        data: {
          userId: target.id,
          event: 'admin_suspend_user',
          detail: JSON.stringify({ by: admin?.id, byEmail: admin?.email, wasSuspended: target.account?.suspended, nowSuspended: true }),
        },
      });
      return NextResponse.json({ ok: true, reason: 'suspended' });
    }

    if (action === 'unsuspend') {
      await prisma.user.update({ where: { id: userId }, data: { account: { update: { suspended: false } } } });
      await prisma.userActivityLog.create({
        data: {
          userId: target.id,
          event: 'admin_unsuspend_user',
          detail: JSON.stringify({ by: admin?.id, byEmail: admin?.email, wasSuspended: target.account?.suspended, nowSuspended: false }),
        },
      });
      return NextResponse.json({ ok: true, reason: 'unsuspended' });
    }

    if (action === 'soft_delete') {
      await prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date() } });
      await prisma.userActivityLog.create({
        data: {
          userId: target.id,
          event: 'admin_soft_delete_user',
          detail: JSON.stringify({ by: admin?.id, byEmail: admin?.email }),
        },
      });
      return NextResponse.json({ ok: true, reason: 'soft_deleted' });
    }

    if (action === 'restore') {
      await prisma.user.update({ where: { id: userId }, data: { deletedAt: null } });
      await prisma.userActivityLog.create({
        data: {
          userId: target.id,
          event: 'admin_restore_user',
          detail: JSON.stringify({ by: admin?.id, byEmail: admin?.email }),
        },
      });
      return NextResponse.json({ ok: true, reason: 'restored' });
    }

    if (action === 'change_role') {
      const allowed = new Set(['Admin', 'Parent', 'Adult', 'Child']);
      if (!targetRole || !allowed.has(targetRole)) {
        return NextResponse.json({ ok: false, reason: 'invalid_role' }, { status: 400 });
      }
      // Prevent predictable default admin from being used in production
      if (targetRole === 'Admin' && (target.email?.toLowerCase() === 'admin@cliqstr.com')) {
        return NextResponse.json({ ok: false, reason: 'restricted_email' }, { status: 400 });
      }

      const prev = target.account?.role || null;
      await prisma.user.update({ where: { id: userId }, data: { account: { upsert: {
        update: { role: targetRole },
        create: { role: targetRole, birthdate: new Date(), isApproved: true },
      } } } });

      await prisma.userActivityLog.create({
        data: {
          userId: target.id,
          event: 'admin_change_role',
          detail: JSON.stringify({ by: admin?.id, byEmail: admin?.email, from: prev, to: targetRole }),
        },
      });
      return NextResponse.json({ ok: true, reason: 'role_changed', role: targetRole });
    }

    return NextResponse.json({ ok: false, reason: 'unsupported_action' }, { status: 400 });
  } catch (err) {
    console.error('[ADMIN][USERS][PATCH] error', err);
    return NextResponse.json({ ok: false, reason: 'server_error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const admin = await getCurrentUser();
    if (!requireAdmin(admin)) {
      return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });
    }

    const userId = id;
    const url = new URL(req.url);
    const hard = url.searchParams.get('hard') === 'true';
    if (!hard) {
      return NextResponse.json({ ok: false, reason: 'hard_delete_flag_required' }, { status: 400 });
    }

    // Danger: hard delete with cascade via Prisma relations as configured.
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ ok: true, reason: 'hard_deleted' });
  } catch (err: any) {
    console.error('[ADMIN][USERS][DELETE] error', err);
    return NextResponse.json({ ok: false, reason: 'server_error' }, { status: 500 });
  }
}
