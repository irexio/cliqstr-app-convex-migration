import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code')?.trim();

    if (!code) {
      return NextResponse.json(
        { valid: false, reason: 'missing_code' },
        { status: 400 }
      );
    }

    const invite = await prisma.invite.findUnique({
      where: { code },
      select: {
        id: true,
        status: true,            // 'pending' | 'accepted' | ...
        used: true,
        expiresAt: true,
        invitedRole: true,       // 'adult' | 'child' (may vary in casing)
        cliqId: true,
        inviteeEmail: true,
        trustedAdultContact: true,
      },
    });

    const now = new Date();
    const expired =
      !!invite?.expiresAt && invite.expiresAt.getTime() < now.getTime();

    // Log once for traceability (no PII beyond code)
    console.log('[INVITE/VALIDATE]', {
      code,
      found: !!invite,
      status: invite?.status,
      used: invite?.used,
      expired,
      role: invite?.invitedRole,
    });

    if (!invite) {
      return NextResponse.json(
        { valid: false, reason: 'not_found' },
        { status: 404 }
      );
    }

    if (expired) {
      return NextResponse.json(
        { valid: false, reason: 'expired' },
        { status: 400 }
      );
    }

    if (invite.status !== 'pending') {
      return NextResponse.json(
        { valid: false, reason: 'not_pending' },
        { status: 400 }
      );
    }

    if (invite.used) {
      return NextResponse.json(
        { valid: false, reason: 'used' },
        { status: 400 }
      );
    }

    const inviteRole = (invite.invitedRole || '').toLowerCase();
    const recipientEmail =
      invite.inviteeEmail || invite.trustedAdultContact || null;

    const res = NextResponse.json({
      valid: true,
      inviteRole,         // 'adult' | 'child'
      inviteId: invite.id,
      cliqId: invite.cliqId,
      recipientEmail,     // used to prefill sign-up
      reason: null,
    });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (err) {
    console.error('[INVITE/VALIDATE] error', err);
    return NextResponse.json(
      { valid: false, reason: 'server_error' },
      { status: 500 }
    );
  }
}
