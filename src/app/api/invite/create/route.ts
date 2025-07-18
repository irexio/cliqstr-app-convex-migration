// 🔐 APA-HARDENED — Invite Email Sender & Creator
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export const dynamic = 'force-dynamic';

type SendInviteEmailParams = {
  to: string;
  cliqName: string;
  inviterName: string;
  cliqId: string;
  invitedRole: 'child' | 'adult' | 'parent';
};

// Function to send invite emails
async function sendInviteEmail({
  to,
  cliqName,
  inviterName,
  cliqId,
  invitedRole,
}: SendInviteEmailParams) {
  const inviteLink = `https://cliqstr.com/invite/${cliqId}`;

  let subject = `You're invited to join ${cliqName} on Cliqstr`;
  let body = '';

  if (invitedRole === 'adult') {
    subject = `Invitation to join ${cliqName} on Cliqstr`;
    body = `
Greetings,

${inviterName} has invited you to join their cliq on Cliqstr.

Click below to accept the invite:
${inviteLink}

This is a private site. To ensure only adults join private cliqs, a credit card is required for age verification (no charge will be made). This helps us protect our community and your privacy.

If you weren't expecting this invitation, you can safely ignore this email.

— The Cliqstr Team
`;
  } else if (invitedRole === 'child' || invitedRole === 'parent') {
    subject = `Parental Approval Needed: Invitation to ${cliqName} on Cliqstr`;
    body = `
Greetings,

Your child has been invited by ${inviterName} to join a private cliq on Cliqstr.

Click below to approve their invitation:
${inviteLink}

Your child may join the cliq for free, but must be authorized by an adult. A credit card is required for verification (no charge will be made). This is to confirm you are an adult and is designed to protect children while using Cliqstr.

If you weren't expecting this invitation, you can safely ignore this email.

— The Cliqstr Team
`;
  }

  // Replace with your real email logic
  console.log('[EMAIL SENT]', { to, subject, body });
}

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
    
    if (existingInvite) {
      console.log('[INVITE_INFO] Invite already exists', { inviteeEmail, cliqId });
      return NextResponse.json({ 
        success: true, 
        inviteCode: existingInvite.code, 
        type: existingInvite.invitedRole === 'adult' ? 'invite' : 'request',
        message: 'Invite already exists'
      });
    }
    
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
    
    // Send the email
    await sendInviteEmail({
      to: inviteeEmail,
      cliqName: cliq.name,
      inviterName: senderName || user.profile?.username || 'A Cliqstr user',
      cliqId: invite.code,
      invitedRole
    });
    
    return NextResponse.json({ 
      success: true, 
      inviteCode: invite.code, 
      type: invitedRole === 'adult' ? 'invite' : 'request'
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
