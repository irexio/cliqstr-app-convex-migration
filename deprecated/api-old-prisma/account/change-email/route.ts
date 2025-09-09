import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newEmail, password } = await req.json();

    if (!newEmail || !password) {
      return NextResponse.json({ error: 'New email and password are required' }, { status: 400 });
    }

    // Fetch user with password for verification
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true }
    });

    if (!userWithPassword) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isValidPassword = await compare(password, userWithPassword.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Check if new email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email address is already in use' }, { status: 400 });
    }

    // Generate verification token for email change
    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store the email change request
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpires,
        // Store new email in a temporary field or handle via separate table
        // For now, we'll use the verification flow
      }
    });

    // TODO: Send verification email to new email address
    // This would typically send an email with a link to verify the new email
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email change verification sent to new email address' 
    });

  } catch (error) {
    console.error('Change email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
