// 🔐 APA-HARDENED — Invite Email Sender & Creator
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { sendInviteEmail } from '@/lib/auth/sendInviteEmail';
import { BASE_URL } from '@/lib/email';

export const dynamic = 'force-dynamic';

// POST route handler for creating invites

// POST route handler for creating invites
export async function POST(req: Request) {
  try {
    // APA: Use getCurrentUser() for session validation
    const user = await getCurrentUser();
    if (!user?.id) {
      console.log('[INVITE_ERROR] Unauthorized - no user ID');
      return NextResponse.json({ error: 'Unauthorized - please sign in again' }, { status: 401 });
    }
    
    // Log the request body
    const body = await req.json();
    console.log('[INVITE_DEBUG] Request payload:', body);
    
    const { cliqId, inviteeEmail, invitedRole = 'child', senderName } = body;
    
    if (!cliqId) {
      console.log('[INVITE_ERROR] Missing cliqId');
      return NextResponse.json({ error: 'Missing cliq ID' }, { status: 400 });
    }
    
    if (!inviteeEmail) {
      console.log('[INVITE_ERROR] Missing inviteeEmail');
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }
    
    if (!invitedRole) {
      console.log('[INVITE_ERROR] Missing invitedRole');
      return NextResponse.json({ error: 'Please select a role (child, adult, or parent)' }, { status: 400 });
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
    const cliq: { name: string } | null = await prisma.cliq.findUnique({
      where: { id: cliqId },
      select: { name: true }
    });
    
    if (!cliq) {
      console.log('[INVITE_ERROR] Cliq not found', { cliqId });
      return NextResponse.json({ error: 'Cliq not found' }, { status: 404 });
    }
    
    // Check if invite already exists
    const existingInvite = await prisma.invite.findFirst({
      where: {
        cliqId,
        inviteeEmail,
        used: false
      }
    });
    
    // If an invite already exists, we'll use it but still send the email
    // This allows for testing email sending with the same email address
    let inviteCode;
    let inviteRole;
    
    if (existingInvite) {
      console.log('[INVITE_INFO] Invite already exists - will resend email', { inviteeEmail, cliqId });
      inviteCode = existingInvite.code;
      inviteRole = existingInvite.invitedRole;
    } else {
      // Create an invite code
      console.log('[INVITE_DEBUG] Creating new invite', { cliqId, inviteeEmail, invitedRole });
      const invite = await prisma.invite.create({
        data: {
          code: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          maxUses: 1,
          used: false,
          invitedRole,
          inviteeEmail,
          cliq: {
            connect: { id: cliqId }
          },
          inviter: {
            connect: { id: user.id }
          }
        }
      });
      
      console.log('[INVITE_DEBUG] Invite created successfully', { inviteCode: invite.code });
      inviteCode = invite.code;
      inviteRole = invitedRole;
    }
    
    // Construct the invite link with the correct base URL
    const inviteLink = `${BASE_URL}/invite/${inviteCode}`;
    
    console.log('[EMAIL DEBUG] Sending invite email to', inviteeEmail);
    
    // Send the email using our standardized email utility
    const emailResult = await sendInviteEmail({
      to: inviteeEmail,
      cliqName: cliq.name,
      inviterName: senderName || user.profile?.username || 'A Cliqstr user',
      inviteLink
    });
    
    if (!emailResult.success) {
      console.error('[EMAIL ERROR] Invite email failed:', emailResult.error);
    } else {
      console.log('[EMAIL SUCCESS] Invite email sent to', inviteeEmail, 'with messageId:', emailResult.messageId);
    }
    
    return NextResponse.json({ 
      success: true, 
      inviteCode: inviteCode, 
      type: inviteRole === 'adult' ? 'invite' : 'request'
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
