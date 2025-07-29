export const dynamic = 'force-dynamic';

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
      console.error('[PLAN_API] No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { plan } = await req.json();
    
    if (!plan) {
      console.error('[PLAN_API] Missing plan in request');
      return NextResponse.json({ error: 'Missing plan' }, { status: 400 });
    }
    
    console.log(`[PLAN_API] Processing plan selection: ${plan} for user ${user.id}`);
    
    // Determine plan type and subscription status
    // Accept any plan value to avoid redirect loops
    let planToSave = plan;
    let stripeStatus = 'active'; // Default to active for all plans
    let isApproved = true; // Default to approved for all plans

    if (plan === 'test') {
      planToSave = 'test';
      stripeStatus = 'test';
      isApproved = true; // Explicitly ensure test plan is approved
      console.log(`[PLAN_API] Setting test plan with approved status for user ${user.id}`);
      
      // Force update the user's approval status in the Account model
      try {
        await prisma.account.upsert({
          where: { userId: user.id },
          update: { isApproved: true },
          create: {
            userId: user.id,
            birthdate: new Date('1990-01-01'), // Default adult birthdate for test accounts
            role: 'Adult',
            isApproved: true,
            plan: 'test'
          }
        });
        console.log(`[PLAN_API] Updated user ${user.id} account approval status to true`);
      } catch (accountUpdateError) {
        console.error(`[PLAN_API] Failed to update account approval status:`, accountUpdateError);
      }
    } else if (plan === 'free') {
      planToSave = 'free';
      stripeStatus = 'free';
    } else if (plan === 'basic') {
      planToSave = 'basic';
      stripeStatus = 'active'; // Mark as active to ensure it persists
    } else if (plan === 'premium' || plan === 'family' || plan === 'group') {
      planToSave = plan; // Save as selected
      stripeStatus = 'active'; // Mark as active instead of pending
    } else {
      // For any other value, just save it as is
      console.log(`[PLAN_API] Saving non-standard plan value: ${plan}`);
    }

    // Find existing account or create one
    const existingAccount = await prisma.account.findUnique({
      where: { userId: user.id }
    });

    let account;
    if (existingAccount) {
      console.log(`[PLAN_API] Updating existing account for user ${user.id}, setting isApproved=${isApproved}`);
      account = await prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          plan: planToSave,
          stripeStatus,
          isApproved
        }
      });
      console.log(`[PLAN_API] Account updated, new values: plan=${account.plan}, isApproved=${account.isApproved}, stripeStatus=${account.stripeStatus}`);
    } else {
      console.log(`[PLAN_API] Creating new account for user ${user.id}, setting isApproved=${isApproved}`);
      account = await prisma.account.create({
        data: {
          userId: user.id,
          role: user.account?.role || 'Adult', // Default to Adult if no role specified
          isApproved,
          plan: planToSave,
          stripeStatus
        }
      });
      console.log(`[PLAN_API] Account created, values: plan=${account.plan}, isApproved=${account.isApproved}, stripeStatus=${account.stripeStatus}`);
    }
    
    console.log(`[PLAN_API] Plan ${planToSave} successfully saved for user ${user.id}`);
    
    // For paid plans, this would redirect to Stripe
    // For free/test plans, we're done
    return NextResponse.json({ 
      success: true, 
      plan: planToSave,
      needsPayment: plan !== 'test' && plan !== 'free',
      account
    });
    
  } catch (error) {
    console.error('[PLAN_API] Error saving plan:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
