// src/app/api/sign-up/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      password,
      birthdate,
      inviteCode,
      email,
    } = body;

    // Basic validation
    if (!password || !birthdate || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // SECURITY: Server-side age verification - NEVER trust client
    const parsedDate = new Date(birthdate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid birthdate' }, { status: 400 });
    }

    const today = new Date();
    let age = today.getFullYear() - parsedDate.getFullYear();
    const monthDiff = today.getMonth() - parsedDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsedDate.getDate())) {
      age--;
    }

    // SECURITY: Determine role server-side based on actual age calculation
    const role = age < 18 ? (inviteCode ? 'child_invited' : 'child_direct') : 'adult';

    // CHILD SAFETY: All minors require invite codes - NO EXCEPTIONS
    if (age < 18) {
      if (!inviteCode) {
        return NextResponse.json({ 
          error: 'Children must sign up through parent invitation only' 
        }, { status: 400 });
      }

      const invite = await prisma.invite.findUnique({
        where: { code: inviteCode },
      });

      if (!invite || invite.status !== 'pending') {
        return NextResponse.json({ error: 'Invalid or expired invite code' }, { status: 400 });
      }

      // SECURITY: Verify invite hasn't exceeded usage limit
      if (invite.maxUses && invite.maxUses <= 0) {
        return NextResponse.json({ error: 'Invite code has been fully used' }, { status: 400 });
      }

      // SECURITY: Check invite expiration
      if (invite.expiresAt && invite.expiresAt < new Date()) {
        return NextResponse.json({ error: 'Invite code has expired' }, { status: 400 });
      }
    }

    // SECURITY: Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // SECURITY: Password strength validation
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }    // SECURITY: Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 12); // Increased from 10 to 12 for better security

    // SECURITY: Database transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      // SECURITY: Generate unique username to prevent conflicts
      let baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      let username = baseUsername;
      let counter = 1;

      // Ensure username uniqueness
      while (await tx.profile.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      const profile = await tx.profile.create({
        data: {
          username,
          password: hashedPassword,
          birthdate: parsedDate,
          role,
          // CHILD SAFETY: Children NEVER auto-approved, adults are
          isApproved: age >= 18,
          stripeStatus: 'free',
          ageGroup: age >= 18 ? 'adult' : 'child',
          userId: user.id,
        },
      });

      // SECURITY: Update invite status atomically for child signups
      if (age < 18 && inviteCode) {
        await tx.invite.update({
          where: { code: inviteCode },
          data: { 
            status: 'used',
            // Decrement usage count if tracking multiple uses
            maxUses: { decrement: 1 }
          },
        });
      }

      return { user, profile };
    });    // SECURITY: Log successful signup for audit trail (without sensitive data)
    console.log(`Successful signup: ${age >= 18 ? 'Adult' : 'Child'} account created for email domain: ${email.split('@')[1]}`);

    return NextResponse.json({ 
      success: true, 
      userId: result.user.id,
      requiresApproval: age < 18 
    });
  } catch (error) {
    // SECURITY: Log errors for monitoring but don't expose details to client
    console.error('Sign-up error:', error);
    return NextResponse.json({ error: 'Account creation failed' }, { status: 500 });
  }
}
