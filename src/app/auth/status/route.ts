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
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    // Get current authenticated user
    const user = await getCurrentUser();

    // Return safe fallback for unauthenticated users
    if (!user) {
      return NextResponse.json({ id: null }, { status: 200 });
    }

    // Get user profile with age-verification related fields
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
    
    // Get user account for payment/plan status
    // Using raw Prisma query to avoid TypeScript errors with new schema
    const accounts = await prisma.$queryRaw`
      SELECT "stripeStatus", plan, "stripeCustomerId"
      FROM "Account"
      WHERE "userId" = ${user.id}
    `;
    
    // Get the first account or set to null
    const account = Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null;
    
    // If no profile exists, simply return user with null profile
    // Frontend will handle redirecting to profile creation
    if (!profile) {
      return NextResponse.json({
        id: user.id,
        email: user.email,
        account,
      });
    }

    // Get user's memberships for access control
    const memberships = await prisma.membership.findMany({
      where: { userId: user.id },
      include: {
        cliq: {
          select: {
            id: true,
            name: true,
            privacy: true,
            // Removed ageRestricted field as it doesn't exist in the schema
          }
        }
      }
    });

    // Ensure child accounts can only access appropriate content
    if (profile?.role === 'Child' && !profile?.isApproved) {
      // Return limited information for unapproved child accounts
      return NextResponse.json({
        id: user.id,
        email: user.email,
        profile,
        isAwaitingApproval: true,
        // No memberships included for unapproved children
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
    // Log error server-side without exposing details to client
    console.error('❌ /api/auth/status error:', err);
    return NextResponse.json({ id: null, error: "Session verification failed" }, { status: 200 }); // Still 200 for UI safety
  }
}
