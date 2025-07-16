// 🔐 APA-HARDENED FALLBACK ROUTE: GET /api/auth/status

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        username: true,
        image: true,
        birthdate: true,
      },
    });
    
    const account = await prisma.account.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        role: true,
        isApproved: true,
        stripeStatus: true,
        plan: true,
        stripeCustomerId: true
      },
    });

    if (!profile) {
      // Standardized user shape for legacy accounts
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          plan: null,
          role: 'Adult',
          approved: false,
          // Legacy account specific fields
          legacyAccount: true,
          profile: {
            role: 'Adult',
            approved: false,
            username: user.email.split('@')[0] || 'user',
          },
          account: {
            stripeStatus: 'incomplete',
            plan: null
          }
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

    if (account?.role === 'Child' && account?.isApproved === false) {
      // Standardized user shape for awaiting approval accounts
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          plan: account?.plan ?? null,
          role: account?.role ?? null,
          approved: false,
          // Awaiting approval specific fields
          profile,
          account,
          isAwaitingApproval: true,
        }
      });
    }

    // Standardized user shape for consistent client-side handling
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        plan: account?.plan ?? null,
        role: account?.role ?? null,
        approved: account?.isApproved ?? null,
        // Include these for backward compatibility but they're not part of the standard shape
        memberships,
        profile,
        account: account ? { ...account, approved: account.isApproved, isApproved: undefined } : null,
      }
    });
  } catch (err) {
    console.error('❌ /api/auth/status error:', err);
    return NextResponse.json(
      { user: null, error: 'Session verification failed' },
      { status: 200 }
    );
  }
}
