// 🔐 APA-HARDENED — Sign-Up API Route
// Final Fixes: added username, fixed email helper param, cleaned all type errors

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { sendParentEmail } from '@/lib/auth/sendParentEmail';
import { sendVerificationEmail } from '@/lib/auth/sendVerificationEmail';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password, birthdate, inviteCode, parentEmail } = parsed.data;

    // Check for existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email is already in use' }, { status: 409 });
    }

    let invitedRole = null;
    let invitedCliqId = null;

    if (inviteCode) {
      const invite = await prisma.invite.findUnique({ where: { code: inviteCode } });

      if (!invite) {
        return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });
      }

      invitedRole = invite.invitedRole;
      invitedCliqId = invite.cliqId;
    }

    const birthDateObj = new Date(birthdate);
    const ageDifMs = Date.now() - birthDateObj.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    const isChild = age < 17;

    if (isChild && !parentEmail && !inviteCode) {
      return NextResponse.json({ error: 'Children must include a parent email' }, { status: 403 });
    }

    const hashedPassword = await hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Create associated profile
    await prisma.profile.create({
      data: {
        userId: newUser.id,
        birthdate: birthDateObj,
        role: invitedRole ?? (isChild ? 'Child' : 'Adult'),
        isApproved: !isChild,
        username: `user-${newUser.id}`, // ✅ temp placeholder
      },
    });

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
      await sendParentEmail({
        to: parentEmail,
        childName: email, // temporary fallback for now
        childId: newUser.id,
        inviteCode: inviteCode ?? undefined,
      });
    } else if (!isChild) {
      // For adult accounts, send an optional verification email
      // This is non-blocking - users can still access the app
      try {
        await sendVerificationEmail({
          to: email,
          userId: newUser.id,
        });
        console.log(`Optional verification email sent to ${email}`);
      } catch (error) {
        // Log but don't fail if verification email fails
        console.error('Failed to send verification email:', error);
        // Non-critical error, don't block account creation
      }
    }

    return NextResponse.json({ success: true, userId: newUser.id });
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
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: process.env.NODE_ENV !== 'production' ? (error instanceof Error ? error.message : String(error)) : undefined 
    }, { status: 500 });
  }
}
