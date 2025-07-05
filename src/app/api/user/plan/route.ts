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
    let planType = 'basic';
    if (plan === 'premium' || plan === 'family' || plan === 'group') {
      planType = 'premium';
    }
    
    // For test/free plan, mark as active immediately and approve the profile
    // For paid plans, they remain pending until payment is confirmed through Stripe
    const stripeStatus = plan === 'test' ? 'free' : 'pending';
    
    // Only mark profile as approved for free/test plan
    if (plan === 'test') {
      await prisma.profile.update({
        where: { userId: user.id },
        data: { isApproved: true }
      });
    }
    // For paid plans, profile will be approved after successful Stripe payment
    
    // Find existing account or create one
    const existingAccount = await prisma.account.findUnique({
      where: { userId: user.id }
    });
    
    let account;
    if (existingAccount) {
      account = await prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          plan: planType,
          stripeStatus
        }
      });
    } else {
      account = await prisma.account.create({
        data: {
          userId: user.id,
          plan: planType,
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
