export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';
import { getCodeFromJson } from '@/lib/invites/getCodeParam';

/**
 * 🔒 Verify Parent API (Testing Version)
 * 
 * For free adults approving child invites - simulates identity verification
 * without actual Stripe integration. In production, this would use Stripe
 * SetupIntent for $0 card verification.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const { code } = await getCodeFromJson(req.clone());
    if (!code) {
      return NextResponse.json({ 
        error: 'Invite code is required' 
      }, { status: 400 });
    }

    // Verify user is Adult with free plan
    if (user.role !== 'Adult') {
      return NextResponse.json({ 
        error: 'Only Adult users can be verified as parents' 
      }, { status: 400 });
    }

    if (user.account?.plan !== 'free') {
      return NextResponse.json({ 
        error: 'This verification is only for free plan users' 
      }, { status: 400 });
    }

    console.log('[VERIFY_PARENT] Verifying free Adult as Parent:', {
      userId: user.id,
      email: user.email,
      currentRole: user.role,
      plan: user.account?.plan,
      code
    });

    // 🧪 TESTING: Simulate successful card verification
    // In production, this would be:
    // 1. Create Stripe SetupIntent with $0 amount
    // 2. Confirm card is valid (no charge)
    // 3. Store verification status
    
    console.log('[VERIFY_PARENT] 🧪 TESTING: Simulating successful card verification');
    
    // Add a small delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update user role to Parent
    await prisma.account.update({
      where: { userId: user.id },
      data: { 
        role: 'Parent',
        // In production, would also store:
        // stripeSetupIntentId: setupIntent.id,
        // verifiedAt: new Date()
      }
    });

    // Update isParent flag on User model
    await prisma.user.update({
      where: { id: user.id },
      data: { isParent: true }
    });

    // Log for audit trail
    console.log('[VERIFY_PARENT] Successfully verified and upgraded user to Parent:', {
      userId: user.id,
      email: user.email,
      code,
      verifiedAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      message: 'Identity verification successful. You are now a verified parent.',
      redirectUrl: `/parents/hq?inviteCode=${code}`,
      testing: true // Flag to indicate this is test mode
    });

  } catch (error: any) {
    console.error('[VERIFY_PARENT_ERROR] Unhandled error:', error);
    return NextResponse.json({ 
      error: 'Verification failed. Please try again.' 
    }, { status: 500 });
  }
}
