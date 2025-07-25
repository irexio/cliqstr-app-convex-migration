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
      console.log('[INVITE_ERROR] Unauthorized - no user ID');
      return NextResponse.json({ error: 'Unauthorized - please sign in again' }, { status: 401 });
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
    const cliq: { name: string } | null = await prisma.cliq.findUnique({
      where: { id: cliqId },
      select: { name: true }
    });
    
    // Use the current user data (already includes profile with username)
    // No need to fetch again since getCurrentUser() already includes profile
    
    if (!cliq) {
      console.log('[INVITE_ERROR] Cliq not found', { cliqId });
      return NextResponse.json({ error: 'Cliq not found' }, { status: 404 });
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
      
      // Prepare the invite data
      const inviteData: any = {
        code: await generateInviteCode(),
        maxUses: 1,
        used: false,
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
          inviteNote: inviteNote || undefined
        });
      }
      
      const invite = await prisma.invite.create({ data: inviteData });
      
      console.log('[INVITE_DEBUG] Invite created successfully', { inviteCode: invite.code });
      inviteCode = invite.code;
      inviteRole = invite.invitedRole;
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
    // Update to use /invite/accept instead of just /invite/
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
        inviteNote
      });
    } else {
      // Send regular invite email for adults
      emailResult = await sendInviteEmail({
        to: targetEmail,
        cliqName: cliq.name,
        inviterName,
        inviteLink
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
