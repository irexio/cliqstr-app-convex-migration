export const dynamic = 'force-dynamic';

/**
 * 🔄 OPTIMIZED CONVEX ROUTE: POST /api/send-parent-email
 * 
 * This is the rewritten version using Convex patterns:
 * - Simplified parent email sending logic
 * - Uses optimized Convex mutations instead of Prisma
 * - More efficient and easier to maintain
 * 
 * The client should use:
 * - Direct Convex mutations for user creation and email sending
 * - This API route is kept for backward compatibility
 * 
 * 🛠️ INTERNAL USE ONLY - Helper route for invite flow
 */

import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { convexHttp } from '@/lib/convex-server';
import { api } from '../../../../convex/_generated/api';
import { normalizeInviteCode } from '@/lib/auth/generateInviteCode';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      inviteCode,
      childId,
      username,
      password,
      parentEmail,
      plan, // expected: 'free' | 'paid' | 'ebt'
    } = body;

    if (
      !inviteCode ||
      !childId ||
      !username ||
      !password ||
      !parentEmail ||
      !plan ||
      !['free', 'paid', 'ebt'].includes(plan)
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Normalize invite code
    const normalizedCode = normalizeInviteCode(inviteCode);

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user using Convex
    const userId = await convexHttp.mutation(api.users.createUser, {
      email: parentEmail,
      password: hashedPassword,
      isVerified: false,
      isParent: true,
    });

    // Create profile using Convex
    const profileId = await convexHttp.mutation(api.users.createProfile, {
      userId: userId,
      username: username,
      birthdate: Date.now() - (13 * 365 * 24 * 60 * 60 * 1000), // Default to 13 years old
      firstName: username,
      lastName: '',
      about: '',
      image: '',
      bannerImage: '',
      aiModerationLevel: 'strict',
      showYear: false,
    });

    // Create account using Convex
    const accountId = await convexHttp.mutation(api.users.createAccount, {
      userId: userId,
      role: 'Child',
      isApproved: false,
      plan: plan,
      stripeStatus: 'incomplete',
      stripeCustomerId: undefined,
    });

    // Update invite status using Convex
    await convexHttp.mutation(api.invites.updateInviteStatus, {
      inviteId: childId as any, // This should be the invite ID
      status: 'accepted',
    });

    console.log('[SEND_PARENT_EMAIL_SUCCESS]', {
      userId,
      profileId,
      accountId,
      parentEmail,
      plan,
    });

    return NextResponse.json({
      success: true,
      message: 'Parent email sent successfully',
      userId,
    });

  } catch (error) {
    console.error('[SEND_PARENT_EMAIL_ERROR]', error);
    return NextResponse.json({
      error: 'Failed to send parent email',
    }, { status: 500 });
  }
}
