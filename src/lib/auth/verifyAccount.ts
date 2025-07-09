/**
 * 🔐 Account Verification Helper
 * 
 * Purpose:
 * - Marks user accounts as verified upon credit card verification
 * - Centralizes verification logic for both payment and email verification
 * - Updates the Account model with verification method
 * 
 * This removes the need for mandatory email verification while maintaining security
 */

import { prisma } from '@/lib/prisma';

interface VerifyAccountOptions {
  userId: string;
  method: 'credit_card' | 'email' | 'parent_approval';
  metadata?: Record<string, any>;
}

/**
 * Marks a user account as verified/approved based on various verification methods
 */
export async function verifyAccount({ userId, method, metadata = {} }: VerifyAccountOptions) {
  try {
    // Get the user's profile and account
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { user: true }
    });
    
    const account = await prisma.account.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new Error(`Profile not found for user ${userId}`);
    }

    // For child accounts, only parent_approval can verify them (APA: check Account, not Profile)
    if (account?.role === 'Child' && method !== 'parent_approval') {
      console.log(`Child account ${userId} requires parent approval, not ${method}`);
      return { success: false, message: 'Child accounts require parent approval' };
    }

    // Update account to mark as approved (APA: approval on Account, not Profile)
    let updatedProfile = profile;
    let updatedAccount = account;
    if (account) {
      updatedAccount = await prisma.account.update({
        where: { userId },
        data: {
          isApproved: true,
          stripeStatus: method === 'credit_card' ? 'verified_by_payment' : 
                      method === 'email' ? 'verified_by_email' : 'verified_by_parent',
          plan: 'basic'
        }
      });
    } else {
      // Fallback: try to get role from metadata, else default to 'Child'
      const role = metadata?.role || 'Child';
      updatedAccount = await prisma.account.create({
        data: {
          userId,
          role,
          isApproved: true,
          stripeStatus: method === 'credit_card' ? 'verified_by_payment' : 
                      method === 'email' ? 'verified_by_email' : 'verified_by_parent',
          plan: 'basic'
        }
      });
    }

    return { 
      success: true, 
      profile: updatedProfile,
      account: updatedAccount,
      message: `Account verified via ${method}` 
    };

  } catch (error) {
    console.error('Account verification error:', error);
    return { success: false, message: 'Failed to verify account', error };
  }
}
