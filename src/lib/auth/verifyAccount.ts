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

import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';

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
    // Use existing Convex functions based on verification method
    switch (method) {
      case 'email':
        // Use the existing email verification function
        await convexHttp.mutation(api.users.markUserVerified, { userId: userId as any });
        break;
        
      case 'credit_card':
        // For credit card verification, we need to update the account
        await convexHttp.mutation(api.accounts.updateAccount, {
          userId: userId as any,
          updates: {
            isApproved: true,
            stripeStatus: 'verified_by_payment',
            plan: 'basic'
          }
        });
        break;
        
      case 'parent_approval':
        // For parent approval, update account
        await convexHttp.mutation(api.accounts.updateAccount, {
          userId: userId as any,
          updates: {
            isApproved: true,
            stripeStatus: 'verified_by_parent',
            plan: 'basic'
          }
        });
        break;
        
      default:
        throw new Error(`Unknown verification method: ${method}`);
    }

    return { 
      success: true, 
      message: `Account verified via ${method}` 
    };

  } catch (error) {
    console.error('Account verification error:', error);
    return { success: false, message: 'Failed to verify account', error };
  }
}
