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
        stripeStatus: true,
        image: true,
        birthdate: true,
      },
    });
    
    // Handle legacy accounts gracefully - if no profile exists, create minimal valid data
    // This ensures APA protection while allowing older accounts to function
    if (!profile) {
      console.log('⚠️ Legacy account detected for user', user.id, '- handling gracefully while maintaining APA');
      
      // For security, treat any account without a complete profile as an adult account requiring verification
      // This is the safest approach for APA compliance
      return NextResponse.json({
        id: user.id,
        email: user.email,
        legacyAccount: true,
        profile: {
          role: 'Adult', 
          isApproved: false,
          username: user.email.split('@')[0] || 'user',
          stripeStatus: 'incomplete'
        }
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
    });
  } catch (err) {
    // Log error server-side without exposing details to client
    console.error('❌ /api/auth/status error:', err);
    return NextResponse.json({ id: null, error: "Session verification failed" }, { status: 200 }); // Still 200 for UI safety
  }
}
