/**
 * 🔄 OPTIMIZED CONVEX ROUTE: POST /api/invites/create
 * 
 * This is the rewritten version using Convex patterns:
 * - Creates invites using optimized Convex mutations
 * - More efficient than the original Prisma version
 * - Enables real-time updates for invite management
 * 
 * @deprecated The original route.ts is deprecated in favor of this Convex version
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';
import { generateJoinCode } from '@/lib/auth/generateJoinCode';

export async function POST(request: NextRequest) {
  try {
    // Auth: inviter must be Parent
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user is a parent using Convex
    const account = await convexHttp.query(api.accounts.getAccountByUserId, {
      userId: user.id as any,
    });

    if (account?.role !== 'Parent') {
      return NextResponse.json({ error: 'Parent role required' }, { status: 403 });
    }

    const body = await request.json();
    const { email, childId } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Step 1: Normalize email
    const emailNorm = email.trim().toLowerCase();

    // Step 2: Look up existing user using Convex
    const existingUser = await convexHttp.query(api.users.getUserByEmail, {
      email: emailNorm,
    });

    // Step 3: Determine targetState
    let targetState: 'new' | 'existing_parent' | 'existing_user_non_parent' | 'invalid_child';
    let targetUserId: string | null = null;

    if (!existingUser) {
      targetState = 'new';
    } else {
      // Get the user's account information
      const account = await convexHttp.query(api.accounts.getAccountByUserId, {
        userId: existingUser._id as any
      });
      
      if (account?.suspended) {
        return NextResponse.json({ 
          error: 'This account cannot receive invites' 
        }, { status: 400 });
      } else if (account?.role === 'Child') {
        return NextResponse.json({ 
          error: 'This email belongs to a child account and cannot be invited as a parent' 
        }, { status: 400 });
      } else if (account?.role === 'Parent') {
        targetState = 'existing_parent';
        targetUserId = existingUser._id;
      } else {
        targetState = 'existing_user_non_parent';
        targetUserId = existingUser._id;
      }
    }

    // Step 4: Create invite using Convex
    const inviteId = await convexHttp.mutation(api.invites.createInvite, {
      token: crypto.randomUUID(),
      joinCode: generateJoinCode(),
      targetEmailNormalized: emailNorm,
      targetUserId: targetUserId as any,
      targetState,
      status: 'pending',
      used: false,
      inviterId: user.id as any,
      inviteeEmail: email, // Keep original casing
      cliqId: undefined, // Not tied to specific cliq for parent invites
      isApproved: false,
    });

    // TODO: Send email with link: ${BASE_URL}/invite/${invite.token}
    
    // Step 5: Response (safe for authenticated inviter UI)
    return NextResponse.json({
      ok: true,
      inviteId,
      targetState
    });

  } catch (error) {
    console.error('[INVITE_CREATE] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
