import { NextResponse, NextRequest } from 'next/server';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';
import { z } from 'zod';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const parentApprovalPlanSchema = z.object({
  approvalToken: z.string().min(1, 'Approval token is required'),
  plan: z.string().min(1, 'Plan selection is required'),
});

/**
 * POST /api/parent-approval/plan
 * 
 * Handles plan selection for new parents during the approval flow
 * This creates the parent account and links it to the pending child signup
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = parentApprovalPlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ 
        error: parsed.error.errors[0]?.message || 'Invalid request data' 
      }, { status: 400 });
    }

    const { approvalToken, plan } = parsed.data;

    console.log(`[PARENT-APPROVAL-PLAN] Processing plan selection for token: ${approvalToken}, plan: ${plan}`);

    // Get the parent approval record
    const approval = await convexHttp.query(api.pendingChildSignups.getParentApprovalByToken, {
      approvalToken,
    });

    if (!approval) {
      return NextResponse.json({ 
        error: 'Invalid or expired approval token' 
      }, { status: 404 });
    }

    if (approval.status !== 'pending') {
      return NextResponse.json({ 
        error: 'This approval has already been processed' 
      }, { status: 400 });
    }

    // Check if parent already exists
    const existingUser = await convexHttp.query(api.users.getUserByEmail, {
      email: approval.parentEmail.toLowerCase().trim(),
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: 'Parent account already exists. Please sign in instead.' 
      }, { status: 400 });
    }

    // Generate secure password for the parent
    const tempPassword = crypto.randomBytes(12).toString('hex');
    const hashedPassword = await import('bcryptjs').then(bcrypt => 
      bcrypt.hash(tempPassword, 12)
    );

    // Create the parent user
    const parentUser = await convexHttp.mutation(api.users.createUser, {
      email: approval.parentEmail.toLowerCase().trim(),
      password: hashedPassword,
      firstName: 'Parent', // We'll let them update this later
      lastName: 'User',
      birthdate: '1990-01-01', // Default adult birthdate
      isVerified: true, // Skip email verification for parent approval flow
    });

    // Create the parent account
    const parentAccount = await convexHttp.mutation(api.accounts.createAccount, {
      userId: parentUser._id,
      role: 'Parent',
      plan: plan,
      isApproved: true,
    });

    // Create the parent profile
    await convexHttp.mutation(api.profiles.createProfile, {
      userId: parentUser._id,
      firstName: 'Parent',
      lastName: 'User',
      displayName: 'Parent User',
      bio: '',
      avatarUrl: '',
    });

    // Create the child user
    const childUser = await convexHttp.mutation(api.users.createUser, {
      email: `${approval.childFirstName.toLowerCase()}.${approval.childLastName.toLowerCase()}@temp.cliqstr.com`,
      password: crypto.randomBytes(12).toString('hex'), // Temporary password
      firstName: approval.childFirstName,
      lastName: approval.childLastName,
      birthdate: approval.childBirthdate,
      isVerified: true,
    });

    // Create the child account
    const childAccount = await convexHttp.mutation(api.accounts.createAccount, {
      userId: childUser._id,
      role: 'Child',
      plan: plan,
      isApproved: false, // Child needs parent approval
    });

    // Create the child profile
    await convexHttp.mutation(api.profiles.createProfile, {
      userId: childUser._id,
      firstName: approval.childFirstName,
      lastName: approval.childLastName,
      displayName: `${approval.childFirstName} ${approval.childLastName}`,
      bio: '',
      avatarUrl: '',
    });

    // Link the child to the parent
    await convexHttp.mutation(api.memberships.createMembership, {
      userId: childUser._id,
      parentId: parentUser._id,
      role: 'child',
      permissions: {
        canPost: true,
        canComment: true,
        canInvite: false,
        canCreateCliqs: false,
        canModerate: false,
      },
    });

    // Mark the approval as completed
    await convexHttp.mutation(api.pendingChildSignups.approveParentApproval, {
      approvalToken,
    });

    console.log(`[PARENT-APPROVAL-PLAN] Successfully created parent and child accounts`);

    // Create a session for the parent
    const { getIronSession } = await import('iron-session');
    const { sessionOptions } = await import('@/lib/auth/session-config');
    
    const session = await getIronSession(req, NextResponse.next(), sessionOptions);
    session.user = {
      id: parentUser._id,
      email: parentUser.email,
      role: 'Parent',
      isVerified: true,
      plan: plan,
    };
    await session.save();

    return NextResponse.json({
      success: true,
      message: 'Parent account created and plan selected successfully',
      user: {
        id: parentUser._id,
        email: parentUser.email,
        role: 'Parent',
        plan: plan,
      },
      child: {
        id: childUser._id,
        name: `${approval.childFirstName} ${approval.childLastName}`,
      },
      tempPassword, // Send back the temporary password for the parent
    });

  } catch (error) {
    console.error('[PARENT-APPROVAL-PLAN] Error processing plan selection:', error);
    return NextResponse.json({ 
      error: 'Failed to process plan selection' 
    }, { status: 500 });
  }
}
