import { NextResponse, NextRequest } from 'next/server';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';
import { z } from 'zod';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const parentApprovalSignupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  birthdate: z.string().min(1, 'Birthdate is required'),
  approvalToken: z.string().min(1, 'Approval token is required'),
});

/**
 * POST /api/parent-approval/signup
 * 
 * Handles parent account creation during the approval flow
 * This creates the parent account and links it to the pending child signup
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = parentApprovalSignupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ 
        error: parsed.error.errors[0]?.message || 'Invalid request data' 
      }, { status: 400 });
    }

    const { firstName, lastName, email, password, birthdate, approvalToken } = parsed.data;

    console.log(`[PARENT-APPROVAL-SIGNUP] Processing parent signup for: ${email}`);

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

    // Verify the email matches the approval
    if (approval.parentEmail.toLowerCase().trim() !== email.toLowerCase().trim()) {
      return NextResponse.json({ 
        error: 'Email does not match the approval request' 
      }, { status: 400 });
    }

    // Check if parent already exists
    const existingUser = await convexHttp.query(api.users.getUserByEmail, {
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: 'An account with this email already exists. Please sign in instead.' 
      }, { status: 400 });
    }

    // Hash the password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the parent user
    const parentUser = await convexHttp.mutation(api.users.createUserWithAccount, {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      birthdate: new Date(birthdate).getTime(),
      role: 'Parent',
      isApproved: true,
      plan: 'test', // Default plan, will be updated during plan selection
      isVerified: true, // Skip email verification for parent approval flow
    });

    // Note: Parent will create their own social media profile later

    // Mark the approval as completed
    await convexHttp.mutation(api.pendingChildSignups.approveParentApproval, {
      approvalToken,
    });

    console.log(`[PARENT-APPROVAL-SIGNUP] Successfully created parent and child accounts`);

    // Create a session for the parent
    const { getIronSession } = await import('iron-session');
    const { sessionOptions, SessionData } = await import('@/lib/auth/session-config');
    
    const session = await getIronSession<SessionData>(req, NextResponse.next(), sessionOptions);
    const now = Date.now();
    const timeoutMins = Number(process.env.SESSION_TIMEOUT_MINUTES || 180);
    
    session.userId = parentUser;
    session.createdAt = now; // legacy
    session.issuedAt = now;
    session.lastActivityAt = now;
    session.lastAuthAt = now;
    session.expiresAt = now + timeoutMins * 60 * 1000;
    session.idleCutoffMinutes = Number(process.env.SESSION_IDLE_CUTOFF_MINUTES || 60);
    session.refreshIntervalMinutes = Number(process.env.SESSION_REFRESH_INTERVAL_MINUTES || 20);
    
    await session.save();

    return NextResponse.json({
      success: true,
      message: 'Parent account created successfully',
      user: {
        id: parentUser,
        email: email,
        role: 'Parent',
        plan: 'test',
      },
      child: {
        firstName: approval.childFirstName,
        lastName: approval.childLastName,
        name: `${approval.childFirstName} ${approval.childLastName}`,
        birthdate: approval.childBirthdate,
      },
    });

  } catch (error) {
    console.error('[PARENT-APPROVAL-SIGNUP] Error processing parent signup:', error);
    return NextResponse.json({ 
      error: 'Failed to process parent signup' 
    }, { status: 500 });
  }
}
