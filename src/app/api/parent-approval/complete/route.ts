/**
 * 🔐 APA-HARDENED ROUTE: POST /api/parent-approval/complete
 *
 * Purpose:
 *   - Completes the parent approval process
 *   - Creates parent account if needed
 *   - Links parent to child account
 *   - Sets child account to approved
 *   - Applies test plan (no Stripe integration)
 *
 * Body Params:
 *   - inviteCode: string (required)
 *   - childId: string (required)
 *   - parentEmail: string (required)
 *   - password: string (required)
 *
 * Returns:
 *   - 200 OK if approval completed successfully
 *   - 400 if missing required params
 *   - 404 if invite not found
 *   - 500 if server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeInviteCode } from '@/lib/auth/generateInviteCode';
import { hash } from 'bcryptjs';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const approvalSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required'),
  childId: z.string().min(1, 'Child ID is required'),
  parentEmail: z.string().email('Valid parent email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = approvalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { inviteCode, childId, parentEmail, password } = parsed.data;

    // Normalize the invite code
    const normalizedCode = normalizeInviteCode(inviteCode);

    // Find the invite
    const invite = await prisma.invite.findUnique({
      where: { code: normalizedCode },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    // Find child user - could be by ID or by invite code
    let childUser = null;
    
    if (invite.inviteType === 'parent-approval') {
      // For parent approval requests initiated before child account creation
      // We need to create the child account now
      
      // Extract child info from the invite
      let childFirstName = invite.friendFirstName || 'Child';
      let childLastName = '';
      let childBirthdate = new Date();
      
      // If we have additional info in the invite note, try to parse it
      if (invite.inviteNote) {
        const match = invite.inviteNote.match(/Child approval request for (.*?) (.*?), age (\d+)/);
        if (match) {
          childFirstName = match[1];
          childLastName = match[2];
          
          // Calculate approximate birthdate based on age
          const age = parseInt(match[3], 10);
          const now = new Date();
          childBirthdate = new Date(now.getFullYear() - age, now.getMonth(), now.getDate());
        }
      }
      
      // Create temporary password for child account
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedChildPassword = await hash(tempPassword, 10);
      
      // Create child user
      childUser = await prisma.user.create({
        data: {
          email: `child-${normalizedCode}@pending.cliqstr.com`, // Temporary email
          password: hashedChildPassword,
        },
      });
      
      // Create child profile
      await prisma.profile.create({
        data: {
          userId: childUser.id,
          firstName: childFirstName,
          lastName: childLastName,
          birthdate: childBirthdate,
          username: `child-${childUser.id}`, // Temporary username
        },
      });
      
      // Create child account with Child role
      await prisma.account.create({
        data: {
          userId: childUser.id,
          role: 'Child',
          isApproved: false, // Will be set to true later
        },
      });
    } else {
      // For standard flow where child account already exists
      childUser = await prisma.user.findUnique({
        where: { id: childId },
        include: {
          account: true,
        },
      });
      
      if (!childUser) {
        return NextResponse.json({ error: 'Child account not found' }, { status: 404 });
      }
    }
    
    // Check if parent already exists
    let parentUser = await prisma.user.findUnique({
      where: { email: parentEmail },
    });
    
    if (!parentUser) {
      // Create parent account
      const hashedPassword = await hash(password, 10);
      
      parentUser = await prisma.user.create({
        data: {
          email: parentEmail,
          password: hashedPassword,
        },
      });
      
      // Create parent profile
      await prisma.profile.create({
        data: {
          userId: parentUser.id,
          firstName: 'Parent', // Default name
          lastName: '',
          birthdate: new Date(), // Default birthdate
          username: `parent-${parentUser.id}`, // Temporary username
        },
      });
      
      // Create parent account with Adult role
      await prisma.account.create({
        data: {
          userId: parentUser.id,
          role: 'Adult',
          isApproved: true,
          plan: 'test', // Apply test plan automatically
        },
      });
    }
    
    // Create parent-child link
    await prisma.parentLink.create({
      data: {
        parentId: parentUser.id,
        childId: childUser.id,
      },
    });
    
    // Update child account to approved
    await prisma.account.update({
      where: { userId: childUser.id },
      data: {
        isApproved: true,
        plan: 'test', // Apply test plan automatically
      },
    });
    
    // Mark invite as used
    await prisma.invite.update({
      where: { code: normalizedCode },
      data: {
        used: true,
        status: 'accepted',
        invitedUserId: childUser.id,
      },
    });
    
    // Create session for parent to automatically log them in
    const response = NextResponse.json({
      success: true,
      message: 'Parent approval completed successfully',
      parentId: parentUser.id,
      childId: childUser.id,
      redirectUrl: '/parents-hq',
    });
    
    // Set session cookie
    response.cookies.set({
      name: 'session',
      value: parentUser.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return response;
  } catch (error) {
    console.error('[PARENT_APPROVAL_COMPLETE_ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ 
      error: `Failed to complete parent approval: ${errorMessage}` 
    }, { status: 500 });
  }
}
