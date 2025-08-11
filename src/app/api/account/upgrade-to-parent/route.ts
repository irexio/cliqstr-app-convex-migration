export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';

/**
 * 🔄 General Parent Account Upgrade API
 * 
 * Upgrades any Adult user to Parent role for child account management.
 * This is the general upgrade path (not tied to specific invite codes).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Verify user is Adult (not already Parent or Child)
    if (user.role !== 'Adult') {
      if (user.role === 'Parent') {
        return NextResponse.json({ 
          success: true,
          message: 'User is already a Parent',
          alreadyParent: true
        });
      }
      
      return NextResponse.json({ 
        error: `Cannot upgrade ${user.role} users to Parent` 
      }, { status: 400 });
    }

    console.log('[ACCOUNT_UPGRADE_TO_PARENT] Upgrading Adult to Parent:', {
      userId: user.id,
      email: user.email,
      currentRole: user.role
    });

    // Update user role to Parent in Account table
    await prisma.account.update({
      where: { userId: user.id },
      data: { role: 'Parent' }
    });

    // Update isParent flag on User model
    await prisma.user.update({
      where: { id: user.id },
      data: { isParent: true }
    });

    console.log('[ACCOUNT_UPGRADE_TO_PARENT] Successfully upgraded user to Parent role');

    return NextResponse.json({ 
      success: true,
      message: 'Successfully upgraded to Parent account',
      newRole: 'Parent'
    });

  } catch (error: any) {
    console.error('[ACCOUNT_UPGRADE_TO_PARENT_ERROR] Unhandled error:', error);
    return NextResponse.json({ 
      error: 'Failed to upgrade account. Please try again.' 
    }, { status: 500 });
  }
}
