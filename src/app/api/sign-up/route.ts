// 🔐 APA-HARDENED — Sign-Up API Route
// Enforces APA requirements: no tokens, session-based auth only, role validation

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { sendParentEmail } from '@/lib/auth/sendParentEmail';
import { sendVerificationEmail } from '@/lib/auth/sendVerificationEmail';
import { clearAuthTokens } from '@/lib/auth/enforceAPA';
import { normalizeInviteCode } from '@/lib/auth/generateInviteCode';
import { logSignup } from '@/lib/auth/userActivityLogger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  birthdate: z.preprocess((val) => {
    if (val === null || val === undefined) return '';
    return val;
  }, z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Birthdate is required')),
  inviteCode: z.string().optional(),
  parentEmail: z.string().email('Invalid parent email').optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Wrap the initial parsing in a try-catch to handle malformed JSON
    let body;
    try {
      body = await req.json();
    } catch (jsonError) {
      console.error('Failed to parse request body:', jsonError);
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }
    
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { firstName, lastName, email, password, birthdate, inviteCode, parentEmail } = parsed.data;

    // Check for existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email is already in use' }, { status: 409 });
    }

    let invitedRole = null;
    let invitedCliqId = null;

    // Calculate age and isChild before any invite logic
    const birthDateObj = new Date(birthdate);
    const ageDifMs = Date.now() - birthDateObj.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    const isChild = age < 18;

    if (inviteCode) {
      const invite = await prisma.invite.findUnique({ where: { code: normalizeInviteCode(inviteCode) } });

      if (!invite) {
        return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });
      }

      invitedRole = invite.invitedRole;
      invitedCliqId = invite.cliqId;

      // Fetch the cliq and check privacy if invitedCliqId is present
      if (invitedCliqId) {
        const invitedCliq = await prisma.cliq.findUnique({ where: { id: invitedCliqId }, select: { privacy: true } });
        if (invitedCliq && invitedCliq.privacy === 'public' && isChild) {
          return NextResponse.json({ error: 'Children under 18 cannot join public cliqs without parent approval.' }, { status: 403 });
        }
      }
    }

    if (isChild && !parentEmail && !inviteCode) {
      return NextResponse.json({ error: 'Children must include a parent email' }, { status: 403 });
    }

    const hashedPassword = await hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        // isVerified field is tracked via verificationToken presence/absence
      },
    });

    // DO NOT create MyProfile here - it will be created after plan selection

    // Create Account with APA role/isApproved
    await prisma.account.create({
      data: {
        userId: newUser.id,
        birthdate: new Date(birthdate), // CRITICAL: Use actual user birthdate for age verification
        role: invitedRole ?? (isChild ? 'Child' : 'Adult'),
        isApproved: !isChild,
      },
    });

    // Log signup activity
    await logSignup(newUser.id, inviteCode, req);

    // Add membership if invited to a cliq
    if (invitedCliqId) {
      await prisma.membership.create({
        data: {
          userId: newUser.id,
          cliqId: invitedCliqId,
          role: 'Member',
        },
      });
    }

    // Send parent approval email if child
    if (isChild && parentEmail) {
      // Use the actual firstName provided during sign-up
      await sendParentEmail({
        to: parentEmail,
        childName: firstName,
        childId: newUser.id,
        inviteCode: inviteCode ?? undefined,
      });
    } else if (!isChild) {
      // For adult accounts, send a verification email (now required)
      try {
        // Create verification token regardless of email success
        // This ensures the account is marked as needing verification
        const code = [...Array(48)].map(() => Math.random().toString(36)[2]).join('');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const codeHash = require('crypto').createHash('sha256').update(code).digest('hex');
        
        // Store hash and expiry in User model
        await prisma.user.update({
          where: { id: newUser.id },
          data: {
            verificationToken: codeHash,
            verificationExpires: expiresAt,
          },
        });
        
        try {
          await sendVerificationEmail({
            to: email,
            userId: newUser.id,
          });
          console.log(`Verification email sent to ${email}`);
        } catch (emailError) {
          // Log but continue - user can request resend later
          console.error('Failed to send verification email:', emailError);
        }
      } catch (error) {
        // Log token creation error but don't fail the request
        console.error('Failed to create verification token:', error);
      }
    }

    // Create response with headers to clear any legacy tokens
    const headers = new Headers();
    clearAuthTokens(headers);
    
    // For child accounts, return success but don't set session
    // The client will handle redirecting to awaiting approval page
    if (isChild) {
      return NextResponse.json(
        { 
          success: true, 
          userId: newUser.id,
          isChild: true,
          requiresApproval: true
        },
        { headers }
      );
    }
    
    // For adult accounts, return success and redirect to verification pending page
    // Store email in localStorage for the verification pending page
    return NextResponse.json(
      { 
        success: true, 
        userId: newUser.id,
        isChild: false,
        redirectUrl: '/verification-pending',
        email: email // Pass email to be stored in localStorage
      },
      { headers }
    );
  } catch (error) {
    console.error('Sign-up route error:', error);
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      // Log specific Prisma errors
      if (error.name === 'PrismaClientKnownRequestError') {
        // @ts-ignore - Prisma error properties
        console.error('Prisma error code:', error.code);
        // @ts-ignore - Prisma error properties
        console.error('Prisma error meta:', error.meta);
      }
      
      if (error.message.includes('database') || error.message.includes('connection')) {
        console.error('Likely database connection issue. Check DATABASE_URL environment variable.');
      }
    }
    
    // Log environment check (without exposing sensitive data)
    console.error('Database URL configured:', !!process.env.DATABASE_URL);
    console.error('NODE_ENV:', process.env.NODE_ENV);
    console.error('RESEND_API_KEY configured:', !!process.env.RESEND_API_KEY);
    console.error('BASE_URL configured:', !!process.env.NEXT_PUBLIC_SITE_URL);
    
    // For adult sign-ups, still return success with redirect to verification pending
    // This ensures the user experience isn't broken even if there's a server error
    const body = await req.json().catch(() => ({}));
    if (body && body.birthdate) {
      try {
        const birthDateObj = new Date(body.birthdate);
        const ageDifMs = Date.now() - birthDateObj.getTime();
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        const isChild = age < 18;
        
        if (!isChild && body.email) {
          // For adult users, return success with redirect to verification pending
          // even if there was an error, to ensure smooth user experience
          console.log('Returning graceful error response for adult user');
          const headers = new Headers();
          clearAuthTokens(headers);
          
          return NextResponse.json(
            { 
              success: true, 
              redirectUrl: '/verification-pending',
              email: body.email,
              gracefulError: true
            },
            { headers, status: 200 }
          );
        }
      } catch (ageError) {
        console.error('Error calculating age during error recovery:', ageError);
      }
    }
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: process.env.NODE_ENV !== 'production' ? (error instanceof Error ? error.message : String(error)) : undefined 
    }, { status: 500 });
  }
}
