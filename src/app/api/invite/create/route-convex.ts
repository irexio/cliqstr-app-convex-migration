export const dynamic = 'force-dynamic';

/**
 * 🔄 OPTIMIZED CONVEX ROUTE: POST /api/invite/create
 * 
 * This is the rewritten version using Convex patterns:
 * - Simplified invite creation logic
 * - Uses optimized Convex mutations instead of complex Prisma operations
 * - More efficient and easier to maintain
 * 
 * The client should use:
 * - useMutation(api.invites.createInviteSimple, { ... }) for real-time updates
 * - This API route is kept for backward compatibility
 */

import { NextResponse } from 'next/server';
import { convexHttp } from '@/lib/convex-server';
import { api } from '../../../../convex/_generated/api';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { sendInviteEmail } from '@/lib/auth/sendInviteEmail';
import { sendChildInviteEmail } from '@/lib/auth/sendChildInviteEmail';
import { generateInviteCode } from '@/lib/auth/generateInviteCode';
import { generateJoinCode } from '@/lib/auth/generateJoinCode';
import { BASE_URL } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    // APA: Use getCurrentUser() for session validation
    const user = await getCurrentUser();
    if (!user?.id) {
      console.log('[INVITE_ERROR] Session expired during invite creation');
      
      return NextResponse.json({ 
        error: 'Your session has expired. Please sign in again to continue.',
        code: 'SESSION_EXPIRED'
      }, { status: 401 });
    }
    
    // Check if user is a child and enforce invite permissions
    if (user.account?.role === 'Child') {
      // Fetch child settings
      const childSettings = await convexHttp.query(api.users.getChildSettings, {
        profileId: user.myProfile!._id as any,
      });
      
      if (!childSettings?.canSendInvites) {
        console.log('[INVITE_ERROR] Child not allowed to send invites', { userId: user.id });
        return NextResponse.json({ 
          error: 'You do not have permission to send invites. Please ask your parent to enable this feature.' 
        }, { status: 403 });
      }
      
      // Check if invite requires approval
      if (childSettings.inviteRequiresApproval) {
        console.log('[INVITE_INFO] Child invite requires parent approval', { userId: user.id });
        
        // Create invite request for parent approval
        const inviteRequestId = await convexHttp.mutation(api.inviteRequests.createInviteRequest, {
          childId: user.id as any,
          cliqId: cliqId as any,
          inviteeEmail: targetEmail,
          invitedRole: invitedRole,
          message: inviteNote,
          status: 'pending',
        });
        
        // TODO: Send notification email to parent about pending invite request
        
        return NextResponse.json({ 
          success: true,
          inviteRequestId,
          message: 'Your invite requires parent approval. It has been sent to your parent for review.' 
        }, { status: 202 });
      }
    }
    
    // Log the request body
    const body = await req.json();
    console.log('[INVITE_DEBUG] Request payload:', body);
    
    // Extract fields from the request body
    const { 
      cliqId, 
      inviteeEmail, 
      invitedRole = 'child', 
      senderName,
      // New fields for redesigned invite system
      inviteType = 'adult',
      friendFirstName,
      friendLastName,
      trustedAdultContact,
      inviteNote
    } = body;
    
    if (!cliqId) {
      console.log('[INVITE_ERROR] Missing cliqId');
      return NextResponse.json({ error: 'Missing cliq ID' }, { status: 400 });
    }
    
    // Validate required fields based on invite type
    if (inviteType === 'child') {
      if (!friendFirstName) {
        console.log('[INVITE_ERROR] Missing friendFirstName for child invite');
        return NextResponse.json({ error: 'Child\'s first name is required' }, { status: 400 });
      }
      
      if (!friendLastName) {
        console.log('[INVITE_ERROR] Missing friendLastName for child invite');
        return NextResponse.json({ error: 'Child\'s last name is required' }, { status: 400 });
      }
      
      if (!trustedAdultContact) {
        console.log('[INVITE_ERROR] Missing trustedAdultContact for child invite');
        return NextResponse.json({ error: 'Parent/guardian email is required' }, { status: 400 });
      }
    } else {
      // Adult invite validation
      if (!inviteeEmail) {
        console.log('[INVITE_ERROR] Missing inviteeEmail for adult invite');
        return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
      }
    }
    
    // For child invites, the inviteeEmail is the trusted adult's email
    const targetEmail = inviteType === 'child' ? trustedAdultContact : inviteeEmail;
    
    if (!targetEmail) {
      console.log('[INVITE_ERROR] No target email determined');
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    // Generate invite codes
    const inviteCode = generateInviteCode();
    const joinCode = generateJoinCode();

    // Create invite using Convex
    const inviteId = await convexHttp.mutation(api.invites.createInvite, {
      token: crypto.randomUUID(),
      joinCode: joinCode,
      code: inviteCode,
      inviteeEmail: targetEmail,
      targetEmailNormalized: targetEmail.toLowerCase(),
      targetUserId: undefined,
      targetState: "new",
      inviterId: user.id as any,
      cliqId: cliqId as any,
      status: "pending",
      used: false,
      acceptedAt: undefined,
      completedAt: undefined,
      invitedUserId: undefined,
      isApproved: false,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      invitedRole: invitedRole,
      maxUses: 1,
      message: inviteNote,
      friendFirstName: friendFirstName,
      friendLastName: friendLastName,
      inviteNote: inviteNote,
      inviteType: inviteType,
      trustedAdultContact: trustedAdultContact,
      parentAccountExists: false,
    });

    // Send email based on invite type
    if (inviteType === 'child') {
      await sendChildInviteEmail({
        to: trustedAdultContact!,
        childName: `${friendFirstName} ${friendLastName}`,
        inviterName: senderName || user.myProfile?.username || 'A friend',
        cliqName: 'the cliq', // TODO: Get actual cliq name
        inviteCode,
        joinCode,
        inviteNote,
        baseUrl: BASE_URL,
      });
    } else {
      await sendInviteEmail({
        to: inviteeEmail,
        inviterName: senderName || user.myProfile?.username || 'A friend',
        cliqName: 'the cliq', // TODO: Get actual cliq name
        inviteCode,
        joinCode,
        inviteNote,
        baseUrl: BASE_URL,
      });
    }

    console.log(`[INVITE_SUCCESS] Created invite ${inviteId} for ${targetEmail}`);
    
    return NextResponse.json({ 
      success: true, 
      inviteId,
      message: 'Invite sent successfully' 
    });

  } catch (error) {
    console.error('[INVITE_ERROR]', error);
    return NextResponse.json({ 
      error: 'Failed to create invite. Please try again.' 
    }, { status: 500 });
  }
}
