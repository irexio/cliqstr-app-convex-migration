// 🔐 APA-HARDENED — Sign-Up API Route
// Handles new user creation, inviteCode validation, age check, and optional parent approval

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { sendParentEmail } from '@/lib/auth/sendParentEmail';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  birthdate: z.string().refine(val => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date < new Date();
  }, 'Please enter a valid birthdate (YYYY-MM-DD)'),
  inviteCode: z.string().optional(),
  parentEmail: z.string().email('Please enter a valid parent email').optional(),
});

// Enhanced age calculation with robust error handling
function calculateAge(birthdate: string): number {
  try {
    let dob: Date;
    
    // Try parsing MM/DD/YYYY format first
    if (birthdate.includes('/')) {
      const parts = birthdate.split('/');
      if (parts.length === 3) {
        const month = parseInt(parts[0], 10) - 1; // months are 0-indexed
        const day = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        dob = new Date(year, month, day);
      } else {
        dob = new Date(birthdate); // fallback
      }
    } else {
      dob = new Date(birthdate); // likely ISO format
    }
    
    if (isNaN(dob.getTime())) {
      console.error('Invalid birthdate provided:', birthdate);
      throw new Error('Invalid birthdate format');
    }
    
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    if (age < 8 || age > 120) {
      console.error('Unrealistic age calculated:', age, 'from birthdate:', birthdate);
      throw new Error('Invalid age calculated');
    }
    
    return age;
  } catch (error) {
    console.error('Age calculation error:', error);
    // Default to child status (requiring parent approval) for safety
    console.warn(`🚨 SECURITY: Defaulting to child status (17) for safety after birthdate parsing failure. Input: "${birthdate}". This could indicate form abuse or bot activity.`);
    return 17; // Assumes a child age if calculation fails (17 and under requires parent approval)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      // Extract the first error message for a more helpful response
      const errorMessage = parsed.error.errors[0]?.message || 'Invalid input';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { email, password, birthdate, inviteCode, parentEmail } = parsed.data;
    
    // Critical safety check: Ensure we have a valid birthdate before proceeding
    let age: number;
    try {
      age = calculateAge(birthdate);
      
      // Safety bounds check - extremely important for child protection
      if (age < 8 || age > 120) {
        console.warn(`🚨 SAFETY ALERT: Suspicious age calculated (${age}) for ${email} - possible abuse attempt`);
        return NextResponse.json(
          { error: 'Please enter a realistic birthdate in MM/DD/YYYY format' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error(`❌ Age calculation failed for ${email}:`, error);
      return NextResponse.json(
        { error: 'Invalid birthdate format. Please use MM/DD/YYYY format.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    // Optional: Validate inviteCode
    if (inviteCode) {
      const invite = await prisma.invite.findUnique({ where: { code: inviteCode } });
      if (!invite || invite.used) {
        return NextResponse.json({ error: 'Invalid or expired invite code' }, { status: 403 });
      }
    }

    const hashed = await hash(password, 10);
    
    // Per APA standard: users 17 and under need parent approval
    const role = age <= 17 ? 'Child' : 'Adult';
    const isApproved = role === 'Adult'; // Adults are auto-approved

    // Generate a more meaningful username based on email with timestamp
    const usernameBase = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    const timestamp = Date.now().toString().slice(-6);
    const username = `${usernameBase}-${timestamp}`;

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed, // Store hashed password in User model
        profile: {
          create: {
            username,
            birthdate: new Date(birthdate),
            role,
            isApproved,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // If child account, send parent approval email
    if (role === 'Child' && parentEmail) {
      await sendParentEmail({
        to: parentEmail,
        childName: user.profile?.username || 'Your child',
        childId: user.id,
      });
    }

    // Optionally mark invite code as used
    if (inviteCode) {
      await prisma.invite.update({
        where: { code: inviteCode },
        data: { used: true },
      });
    }

    // Return success with appropriate flags
    return NextResponse.json({ 
      success: true,
      requiresApproval: role === 'Child', // This helps frontend redirect appropriately
      message: role === 'Child' 
        ? 'Account created. Parent approval required.' 
        : 'Account created successfully.'
    });
  } catch (err) {
    console.error('❌ Sign-up error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
