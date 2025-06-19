import { NextResponse } from 'next/server';

// Temp mock invite list — will replace with real DB later
const invites = [
  {
    code: 'abc123',
    cliqId: 'cliq_001',
    inviter: 'user_001',
    role: 'child_invited',
    expiresAt: '2025-06-30T00:00:00Z',
  },
  {
    code: 'fun456',
    cliqId: 'cliq_dinos',
    inviter: 'user_002',
    role: 'child_invited',
    expiresAt: '2025-06-15T00:00:00Z',
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ valid: false, error: 'Missing invite code' }, { status: 400 });
  }

  const invite = invites.find((i) => i.code === code);

  if (!invite) {
    return NextResponse.json({ valid: false, error: 'Invite not found' }, { status: 404 });
  }

  const expired = new Date(invite.expiresAt) < new Date();
  if (expired) {
    return NextResponse.json({ valid: false, error: 'Invite expired' }, { status: 410 });
  }

  return NextResponse.json({
    valid: true,
    cliqId: invite.cliqId,
    role: invite.role,
    inviter: invite.inviter,
  });
}
