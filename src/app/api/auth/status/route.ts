// 🔐 APA-HARDENED FALLBACK ROUTE: GET /api/auth/status

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ id: null }, { status: 200 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        username: true,
        role: true,
        isApproved: true,
        image: true,
        birthdate: true,
      },
    });
    
    const account = await prisma.account.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        stripeStatus: true,
        plan: true,
        stripeCustomerId: true
      },
    });

    if (!profile) {
      return NextResponse.json({
        id: user.id,
        email: user.email,
        legacyAccount: true,
        profile: {
          role: 'Adult',
          isApproved: false,
          username: user.email.split('@')[0] || 'user',
        },
        account: {
          stripeStatus: 'incomplete',
          plan: null
        }
      });
    }

    const memberships = await prisma.membership.findMany({
      where: { userId: user.id },
      include: {
        cliq: {
          select: {
            id: true,
            name: true,
            privacy: true,
          },
        },
      },
    });

    if (profile.role === 'Child' && !profile.isApproved) {
      return NextResponse.json({
        id: user.id,
        email: user.email,
        profile,
        isAwaitingApproval: true,
      });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      memberships,
      profile,
      account,
    });
  } catch (err) {
    console.error('❌ /api/auth/status error:', err);
    return NextResponse.json(
      { id: null, error: 'Session verification failed' },
      { status: 200 }
    );
  }
}
