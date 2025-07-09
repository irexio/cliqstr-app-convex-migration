/**
 * 🔐 APA-HARDENED ROUTE: GET /api/auth/status
 *
 * Purpose:
 *   - Confirms authenticated user and returns profile + account
 *   - Supports sign-in flow, navbar state, and route gating
 *   - Returns nulls safely if no profile or account exist
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';

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

        image: true,
        birthdate: true,
      },
    });

    const account = await prisma.account.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        plan: true,
        stripeStatus: true,
        stripeCustomerId: true,
        role: true,
        isApproved: true,
      },
    });

    const memberships = await prisma.membership.findMany({
      where: { userId: user.id },
      include: {
        cliq: {
          select: {
            id: true,
            name: true,
            privacy: true,
          }
        }
      }
    });

    // Unapproved children only return limited info (APA: check Account, not Profile)
    if (account?.role === 'Child' && !account?.isApproved) {
      return NextResponse.json({
        id: user.id,
        email: user.email,
        profile,
        isAwaitingApproval: true
      });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      profile: profile || null,
      account: account || null,
      memberships
    });
  } catch (err) {
    console.error('❌ /api/auth/status error:', err);
    return NextResponse.json({ id: null, error: 'Session verification failed' }, { status: 200 });
  }
}
