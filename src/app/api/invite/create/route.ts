// 🔐 APA-HARDENED — Invite Email Sender & Creator
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { sendInviteEmail } from '@/lib/auth/sendInviteEmail';
import { sendChildInviteEmail } from '@/lib/auth/sendChildInviteEmail';
import { generateInviteCode } from '@/lib/auth/generateInviteCode';
import { BASE_URL } from '@/lib/email';

export const dynamic = 'force-dynamic';

// POST route handler for creating invites
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
    if (user.role === 'Child') {
      // Fetch child settings
      const childSettings = await prisma.childSettings.findUnique({
        where: { profileId: user.myProfile?.id }
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
        // TODO: Create invite request instead of direct invite
        // For now, we'll note this in the response
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
    
    // For child invites, check if parent email already has an account
    let parentAccountExists = false;
    if (inviteType === 'child') {
      const existingParent = await prisma.user.findUnique({
        where: { email: targetEmail },
        include: { account: true }
      });
      
      if (existingParent) {
        const userRole = existingParent.account?.role;
        
        if (userRole === 'Parent') {
          // User is already a parent - streamlined flow
          parentAccountExists = true;
          console.log('[INVITE_INFO] Parent email already has Parent account:', {
            email: targetEmail,
            isVerified: existingParent.isVerified,
            role: userRole,
            hasPayment: !!existingParent.account?.stripeCustomerId
          });
          
          if (!existingParent.account?.stripeCustomerId) {
            console.log('[INVITE_WARNING] Parent account exists but no payment method verified');
          }
        } else if (userRole === 'Adult') {
          // User exists but is Adult role - needs upgrade to Parent
          parentAccountExists = false; // Treat as new parent for email flow
          console.log('[INVITE_INFO] Email belongs to Adult account, will need to upgrade to Parent role:', {
            email: targetEmail,
            currentRole: userRole,
            isVerified: existingParent.isVerified
          });
        } else {
          // User exists but has other role (Child, etc.) - this shouldn't happen for parent emails
          console.log('[INVITE_ERROR] Parent email belongs to non-adult account:', {
            email: targetEmail,
            role: userRole
          });
          return NextResponse.json({ 
            error: 'This email address is associated with a child account. Please use a different parent/guardian email address.',
            code: 'INVALID_PARENT_EMAIL'
          }, { status: 400 });
        }
      } else {
        console.log('[INVITE_INFO] Parent email is new, will need to create account and verify payment');
      }
    }
    
    // Verify user is a member of the cliq
    const membership = await prisma.membership.findFirst({
      where: {
        userId: user.id,
        cliqId: cliqId
      }
    });
    
    if (!membership) {
      console.log('[INVITE_ERROR] User not a member of cliq', { userId: user.id, cliqId });
      return NextResponse.json({ error: 'You must be a member of this cliq to send invites' }, { status: 403 });
    }
    
    // Get cliq details
    const cliq: { name: string; ownerId: string; privacy: string } | null = await prisma.cliq.findUnique({
      where: { id: cliqId },
      select: { name: true, ownerId: true, privacy: true }
    });
    
    // Use the current user data (already includes profile with username)
    // No need to fetch again since getCurrentUser() already includes profile
    
    if (!cliq) {
      console.log('[INVITE_ERROR] Cliq not found', { cliqId });
      return NextResponse.json({ error: 'Cliq not found' }, { status: 404 });
    }

    if ((cliq.privacy === 'private' || cliq.privacy === 'semi_private') && cliq.ownerId !== user.id) {
      console.log('[INVITE_ERROR] Non-owner cannot invite to private cliq', { userId: user.id, cliqId, privacy: cliq.privacy });
      return NextResponse.json({ error: 'Only the owner can invite members to this cliq' }, { status: 403 });
    }
    
    // Check if invite already exists
    const existingInvite = await prisma.invite.findFirst({
      where: {
        cliqId,
        inviteeEmail: targetEmail,
        used: false
      },
      select: {
        id: true,
        code: true,
        invitedRole: true,
        friendFirstName: true,
        trustedAdultContact: true,
        inviteType: true,
        inviteNote: true
      }
    });
    
    // If an invite already exists, we'll use it but still send the email
    // This allows for testing email sending with the same email address
    let inviteCode;
    let inviteRole;
    
    if (existingInvite) {
      console.log('[INVITE_INFO] Invite already exists - will resend email', { email: targetEmail, cliqId });
      inviteCode = existingInvite.code;
      inviteRole = existingInvite.invitedRole;
      
      // Update the existing invite with the new fields if needed
      if (inviteType === 'child') {
        if (existingInvite.friendFirstName !== friendFirstName || existingInvite.inviteNote !== inviteNote) {
          await prisma.invite.update({
            where: { id: existingInvite.id },
            data: {
              // Use Prisma's raw update to set fields that might not be in the TypeScript definitions yet
              friendFirstName,
              trustedAdultContact,
              inviteType,
              inviteNote
            } as any
          });
          console.log('[INVITE_INFO] Updated existing invite with new child info');
        }
      }
    } else {
      // Create an invite code
      console.log('[INVITE_DEBUG] Creating new invite', { 
        cliqId, 
        email: targetEmail, 
        inviteType,
        invitedRole: inviteType === 'child' ? 'child' : 'adult'
      });
      
      // Prepare the invite data with 36-hour expiry
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 36);
      
      const inviteData: any = {
        code: await generateInviteCode(),
        maxUses: 1,
        used: false,
        expiresAt,
        invitedRole: inviteType === 'child' ? 'child' : 'adult',
        inviteeEmail: targetEmail,
        inviteType,
        cliq: {
          connect: { id: cliqId }
        },
        inviter: {
          connect: { id: user.id }
        }
      };
      
      // Add child-specific fields if needed
      if (inviteType === 'child') {
        Object.assign(inviteData, {
          friendFirstName,
          trustedAdultContact,
          inviteNote: inviteNote || undefined,
          parentAccountExists // Store whether parent already has account
        });
      }
      
      const invite = await prisma.invite.create({ data: inviteData });

      console.log('[INVITE_DEBUG] Invite created successfully', { 
        inviteCode: invite.code,
        inviteId: invite.id,
        invitedRole: invite.invitedRole,
        targetEmail: invite.inviteeEmail
      });
      
      inviteCode = invite.code;
      inviteRole = invite.invitedRole;
      
      // ✅ APA Upgrade: If user invites their own child, promote them to Parent
      if (
        inviteType === 'child' &&
        targetEmail === user.email &&
        user.role !== 'Parent'
      ) {
        console.log(`[ROLE UPGRADE] ${user.email} is inviting their own child — upgrading to Parent`);
      
        await prisma.user.update({
          where: { id: user.id },
          data: { isParent: true }
        });
      }
    }
           
    // We'll update the invite link format later
    
    console.log('[EMAIL DEBUG] Sending invite email to', targetEmail);
    
    // Get the best available inviter name for personalization
    // Priority: full name -> firstName -> email prefix -> username -> fallback
    const fullName = user?.myProfile?.firstName && user?.myProfile?.lastName 
      ? `${user.myProfile.firstName} ${user.myProfile.lastName}`
      : null;
    
    const inviterName = fullName ||
                       user?.myProfile?.firstName ||
                       (user?.email ? user.email.split('@')[0] : null) ||
                       user?.myProfile?.username || 
                       senderName || 
                       'Someone';
    
    console.log('[EMAIL DEBUG] Inviter data:', {
      username: user?.myProfile?.username,
      email: user?.email,
      senderName,
      finalInviterName: inviterName
    });
    
    console.log('[EMAIL DEBUG] Using inviter name:', inviterName);
    
    // Construct the invite link with the correct base URL and path
    // Both child and adult invites go to the unified accept flow
    const inviteLink = `${BASE_URL}/invite/accept?code=${inviteCode}`;
    
    console.log('[EMAIL DEBUG] Using invite link:', inviteLink);
    
    // Send the appropriate email based on invite type
    let emailResult;
    
    if (inviteType === 'child') {
      // Send email to trusted adult for child invite
      emailResult = await sendChildInviteEmail({
        to: targetEmail,
        cliqName: cliq.name,
        inviterName,
        inviteLink,
        friendFirstName,
        inviteNote,
        inviteCode,
        parentAccountExists
      });
    } else {
      // Send regular invite email for adults
      emailResult = await sendInviteEmail({
        to: targetEmail,
        cliqName: cliq.name,
        inviterName,
        inviteLink,
        inviteCode
      });
    }
    
    if (!emailResult.success) {
      console.error('[EMAIL ERROR] Invite email failed:', emailResult.error);
    } else {
      console.log('[EMAIL SUCCESS] Invite email sent to', targetEmail, 'with messageId:', emailResult.messageId);
    }
    
    return NextResponse.json({ 
      success: true, 
      inviteCode: inviteCode, 
      type: inviteType === 'adult' ? 'invite' : 'request'
    });
    
  } catch (error: any) {
    // Check for specific database errors
    if (error.code === 'P2002') {
      console.error('[INVITE_ERROR] Duplicate invite:', error);
      return NextResponse.json({ error: 'This email has already been invited' }, { status: 409 });
    }
    
    console.error('[INVITE_ERROR] Unhandled error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create invite',
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    }, { status: 500 });
  }
}
