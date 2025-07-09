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
};

// Function to send invite emails
async function sendInviteEmail({
  to,
  cliqName,
  inviterName,
  cliqId,
}: SendInviteEmailParams) {
  const inviteLink = `https://cliqstr.com/invite/${cliqId}`; // Or your actual invite URL

  const subject = `You're invited to join ${cliqName} on Cliqstr`;

  const body = `
Hi there,

${inviterName} has invited you to join the private Cliq "${cliqName}".

Click below to approve and set up your child's access:
${inviteLink}

This invite is specific to Cliq ID: ${cliqId}.

If you weren’t expecting this email, you can ignore it.

— The Cliqstr Team
`;

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
    const { cliqId, email, senderName } = await req.json();
    
    if (!cliqId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get cliq details
    const cliq = await prisma.cliq.findUnique({
      where: { id: cliqId }
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
        invitedRole: 'Child', // Default role for invitees
        inviter: {
          connect: { id: user.id } // Use the authenticated user's ID
        }
      }
    });
    
    // Send the email
    await sendInviteEmail({
      to: email,
      cliqName: cliq.name,
      inviterName: senderName || 'A Cliqstr user',
      cliqId: invite.code
    });
    
    return NextResponse.json({ 
      success: true, 
      inviteCode: invite.code 
    });
    
  } catch (error) {
    console.error('Invite creation error:', error);
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
  }
}
