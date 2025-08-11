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

    const { action } = await req.json().catch(() => ({}));
    if (!action) return NextResponse.json({ ok: false, reason: 'missing_action' }, { status: 400 });

    const userId = id;

    if (action === 'approve') {
      await prisma.user.update({ where: { id: userId }, data: { account: { update: { isApproved: true } } } });
      return NextResponse.json({ ok: true, reason: 'approved' });
    }

    if (action === 'deactivate') {
      await prisma.user.update({ where: { id: userId }, data: { account: { update: { isApproved: false } } } });
      return NextResponse.json({ ok: true, reason: 'deactivated' });
    }

    if (action === 'suspend') {
      await prisma.user.update({ where: { id: userId }, data: { account: { update: { suspended: true } } } });
      return NextResponse.json({ ok: true, reason: 'suspended' });
    }

    if (action === 'unsuspend') {
      await prisma.user.update({ where: { id: userId }, data: { account: { update: { suspended: false } } } });
      return NextResponse.json({ ok: true, reason: 'unsuspended' });
    }

    if (action === 'soft_delete') {
      await prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date() } });
      return NextResponse.json({ ok: true, reason: 'soft_deleted' });
    }

    if (action === 'restore') {
      await prisma.user.update({ where: { id: userId }, data: { deletedAt: null } });
      return NextResponse.json({ ok: true, reason: 'restored' });
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
