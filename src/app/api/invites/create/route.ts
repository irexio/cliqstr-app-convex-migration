import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/getServerSession';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    // Auth: inviter must be Parent
    const session = await getServerSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const inviterAccount = await prisma.account.findFirst({
      where: { userId: session.id }
    });

    if (inviterAccount?.role !== 'Parent') {
      return NextResponse.json({ error: 'Parent role required' }, { status: 403 });
    }

    const body = await request.json();
    const { email, childId } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Step 1: Normalize email
    const emailNorm = email.trim().toLowerCase();

    // Step 2: Look up existing user
    const user = await prisma.user.findUnique({
      where: { email: emailNorm },
      include: { account: true }
    });

    // Step 3: Determine targetState
    let targetState: 'new' | 'existing_parent' | 'existing_user_non_parent' | 'invalid_child';
    let targetUserId: string | null = null;

    if (!user) {
      targetState = 'new';
    } else if (user.account?.suspended) {
      return NextResponse.json({ 
        error: 'This account cannot receive invites' 
      }, { status: 400 });
    } else if (user.account?.role === 'Child') {
      return NextResponse.json({ 
        error: 'This email belongs to a child account and cannot be invited as a parent' 
      }, { status: 400 });
    } else if (user.account?.role === 'Parent') {
      targetState = 'existing_parent';
      targetUserId = user.id;
    } else {
      targetState = 'existing_user_non_parent';
      targetUserId = user.id;
    }

    // Step 4: Create invite
    const invite = await prisma.invite.create({
      data: {
        token: nanoid(),
        targetEmailNormalized: emailNorm,
        targetUserId,
        targetState,
        status: 'pending',
        used: false,
        childId: childId || null,
        inviterId: session.id,
        inviteeEmail: email, // Keep original casing
        cliqId: undefined, // Not tied to specific cliq for parent invites
      }
    });

    // TODO: Send email with link: ${BASE_URL}/invite/${invite.token}
    
    // Step 5: Response (safe for authenticated inviter UI)
    return NextResponse.json({
      ok: true,
      inviteId: invite.id,
      targetState
    });

  } catch (error) {
    console.error('[INVITE_CREATE] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
