export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';

/**
 * 🔄 Upgrade Adult to Parent API
 * 
 * Silently upgrades an Adult user with a paid plan to Parent role
 * when they're approving a child invite. This is Sol's optimized flow
 * for users who have already verified their identity with payment.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const { inviteCode } = await req.json();
    
    if (!inviteCode) {
      return NextResponse.json({ 
        error: 'Invite code is required' 
      }, { status: 400 });
    }

    // Verify user is Adult with paid plan
    if (user.role !== 'Adult') {
      return NextResponse.json({ 
        error: 'Only Adult users can be upgraded to Parent' 
      }, { status: 400 });
    }

    if (!user.account?.plan || user.account.plan === 'free') {
      return NextResponse.json({ 
        error: 'User must have a paid plan to be auto-upgraded to Parent' 
      }, { status: 400 });
    }

    // Verify they have payment verification (stripeCustomerId)
    if (!user.account.stripeCustomerId) {
      return NextResponse.json({ 
        error: 'User must have verified payment method' 
      }, { status: 400 });
    }

    console.log('[UPGRADE_TO_PARENT] Auto-upgrading Adult to Parent:', {
      userId: user.id,
      email: user.email,
      currentRole: user.role,
      plan: user.account.plan,
      hasPayment: !!user.account.stripeCustomerId,
      inviteCode
    });

    // Update user role to Parent
    await prisma.account.update({
      where: { userId: user.id },
      data: { role: 'Parent' }
    });

    // Update isParent flag on User model
    await prisma.user.update({
      where: { id: user.id },
      data: { isParent: true }
    });

    console.log('[UPGRADE_TO_PARENT] Successfully upgraded user to Parent role');

    return NextResponse.json({ 
      success: true,
      message: 'Successfully upgraded to Parent role',
      redirectUrl: `/parents/hq?inviteCode=${inviteCode}`
    });

  } catch (error: any) {
    console.error('[UPGRADE_TO_PARENT_ERROR] Unhandled error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
