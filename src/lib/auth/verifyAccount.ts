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

    // For child accounts, only parent_approval can verify them
    if (profile.role === 'Child' && method !== 'parent_approval') {
      console.log(`Child account ${userId} requires parent approval, not ${method}`);
      return { success: false, message: 'Child accounts require parent approval' };
    }

    // Update profile to mark as approved
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        isApproved: true
      }
    });
    
    // Track verification method in Account.stripeStatus field
    let updatedAccount;
    if (account) {
      updatedAccount = await prisma.account.update({
        where: { userId },
        data: {
          stripeStatus: method === 'credit_card' ? 'verified_by_payment' : 
                      method === 'email' ? 'verified_by_email' : 'verified_by_parent'
        }
      });
    } else {
      updatedAccount = await prisma.account.create({
        data: {
          userId,
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
