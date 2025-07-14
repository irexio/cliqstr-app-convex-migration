import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';

/**
 * API endpoint to save user's plan selection
 * This is called from the choose-plan page
 * For free/test plans, this directly updates the Account record
 * For paid plans, this would normally redirect to Stripe
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { plan } = await req.json();
    
    if (!plan) {
      return NextResponse.json({ error: 'Missing plan' }, { status: 400 });
    }
    
    // Determine plan type and subscription status
    // Determine plan type and stripe status
    let planToSave = plan;
    let stripeStatus = 'pending';
    let isApproved = false;

    if (plan === 'test') {
      planToSave = 'test';
      stripeStatus = 'test';
      isApproved = true;
    } else if (plan === 'free') {
      planToSave = 'free';
      stripeStatus = 'free';
      isApproved = true;
    } else if (plan === 'premium' || plan === 'family' || plan === 'group') {
      planToSave = plan; // Save as selected
      stripeStatus = 'pending'; // Will be updated after Stripe
    }

    // Find existing account or create one
    const existingAccount = await prisma.account.findUnique({
      where: { userId: user.id }
    });

    let account;
    if (existingAccount) {
      account = await prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          plan: planToSave,
          stripeStatus,
          isApproved
        }
      });
    } else {
      account = await prisma.account.create({
        data: {
          userId: user.id,
          role: user.account?.role || 'Child',
          isApproved,
          plan: planToSave,
          stripeStatus
        }
      });
    }
    
    // For paid plans, this would redirect to Stripe
    // For free/test plans, we're done
    return NextResponse.json({ 
      success: true, 
      plan: plan,
      needsPayment: plan !== 'test',
      account
    });
    
  } catch (error) {
    console.error('[PLAN_SELECTION_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
