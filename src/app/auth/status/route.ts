/**
 * 🔐 APA-HARDENED ROUTE: GET /api/auth/status
 *
 * Purpose:
 *   - Returns a snapshot of the currently authenticated user
 *   - Includes user ID, email, profile info, and cliq memberships
 *   - Supports Feature Panel, Navbar auth check, Parent HQ, and more
 *
 * Behavior:
 *   - Returns { id: null } if unauthenticated (safe fallback)
 *   - Never throws 401 — UI-safe for passive polling or client auth logic
 *
 * 🔐 DO NOT DELETE OR IMPORT THIS FILE DIRECTLY
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
        role: true,
        isApproved: true,
        stripeStatus: true,
        image: true,
        birthdate: true,
      },
    });

    const memberships = await prisma.membership.findMany({
      where: { userId: user.id },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      memberships,
      profile,
    });
  } catch (err) {
    console.error('❌ /auth/status error:', err);
    return NextResponse.json({ id: null }, { status: 500 });
  }
}
