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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { cliqId, inviteeEmail, invitedRole = 'child', senderName } = await req.json();
    
    if (!cliqId || !inviteeEmail || !invitedRole) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get cliq details
    const cliq: { name: string } | null = await prisma.cliq.findUnique({
      where: { id: cliqId },
      select: { name: true }
    });
    
    if (!cliq) {
      return NextResponse.json({ error: 'Cliq not found' }, { status: 404 });
    }
    
    // Create an invite code
    const invite = await prisma.invite.create({
      data: {
        code: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        maxUses: 1,
        used: false,
        cliqId,
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
    
  } catch (error) {
    console.error('Invite creation error:', error);
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
  }
}
