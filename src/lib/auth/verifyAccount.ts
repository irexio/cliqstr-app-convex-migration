/**
 * 🔐 Account Verification Helper
 * 
 * Purpose:
 * - Marks user accounts as verified upon credit card verification
 * - Centralizes verification logic for both payment and email verification
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
    // Get the user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { user: true }
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
        isApproved: true,
        // Track verification method in stripeStatus field (repurposing existing field)
        stripeStatus: method === 'credit_card' ? 'verified_by_payment' : 
                     method === 'email' ? 'verified_by_email' : 'verified_by_parent'
      }
    });

    return { 
      success: true, 
      profile: updatedProfile,
      message: `Account verified via ${method}` 
    };

  } catch (error) {
    console.error('Account verification error:', error);
    return { success: false, message: 'Failed to verify account', error };
  }
}
