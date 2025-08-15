import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth/session-config';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Sol's Rule: Require pending_invite cookie
    const inviteCode = cookieStore.get('pending_invite')?.value;
    if (!inviteCode) {
      return NextResponse.json({ ok: false, error: 'No pending invite' }, { status: 400 });
    }

    // Parse request body
    const { firstName, lastName, email, birthdate, password, plan } = await request.json();
    
    if (!firstName || !lastName || !email || !birthdate || !password) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Sol's Rule: Normalize email (trim+lower)
    const normalizedEmail = email.trim().toLowerCase();

    // 🎯 Sol's Rule: Validate invite (not expired)
    const invite = await prisma.invite.findUnique({
      where: { code: inviteCode },
      select: {
        id: true,
        expiresAt: true,
        status: true,
        cliqId: true
      }
    });

    if (!invite || invite.status !== 'pending' || (invite.expiresAt && invite.expiresAt < new Date())) {
      return NextResponse.json({ ok: false, error: 'Invalid or expired invite' }, { status: 400 });
    }

    // 🎯 Sol's Atomic Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Hash password with bcrypt
      const hashedPassword = await bcrypt.hash(password, 12);

      // Upsert User
      const user = await tx.user.upsert({
        where: { email: normalizedEmail },
        create: {
          email: normalizedEmail,
          password: hashedPassword
        },
        update: {
          password: hashedPassword // Update password if user exists
        }
      });

      // Upsert Account for user
      const account = await tx.account.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          role: 'Parent',
          isApproved: true,
          plan: 'test',
          birthdate: new Date(birthdate)
        },
        update: {
          role: 'Parent',
          isApproved: true,
          plan: 'test',
          birthdate: new Date(birthdate)
        }
      });

      // Create/Upsert MyProfile with firstName, lastName
      const profile = await tx.myProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.random().toString(36).slice(2, 6)}`,
          birthdate: new Date(birthdate)
        },
        update: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          birthdate: new Date(birthdate)
        }
      });

      // Update Invite - Sol's Rule: Keep it alive until final step
      await tx.invite.update({
        where: { id: invite.id },
        data: {
          invitedUserId: user.id,
          status: 'accepted'
          // Do NOT set used = true yet - keep invite alive
        }
      });

      return { user, account, profile };
    });

    // 🎯 Sol's Rule: Start iron-session
    const session = await getIronSession(cookieStore, sessionOptions);
    (session as any).userId = result.user.id;
    (session as any).createdAt = Date.now();
    await session.save();

    console.log('[WIZARD] Parent signup successful:', {
      userId: result.user.id,
      email: normalizedEmail,
      inviteCode
    });

    // 🎯 Sol's Rule: Response with no redirect
    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('[WIZARD] Parent signup error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
