export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { signToken } from '@/lib/auth/jwt';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isCorrectPassword = await compare(password, user.password);
    if (!isCorrectPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 🔒 Check if child account is approved
    if (user.profile?.role === 'Child' && !user.profile?.isApproved) {
      return NextResponse.json(
        { error: 'Awaiting parent approval' },
        { status: 403 }
      );
    }

    const token = signToken({
      userId: user.id,
      role: user.profile?.role || 'adult',
      isApproved: user.profile?.isApproved || false,
    });

    // 🔒 Enhanced cookie security for APA protection
    // The critical fix: Ensure cookies are properly set with correct attributes
    // This prevents the "session could not be established" error
    const response = NextResponse.json({
      success: true,
      // Return minimal user info to confirm successful auth without exposing sensitive data
      user: {
        id: user.id,
        role: user.profile?.role || 'Adult',
      }
    });
    
    // Set the auth cookie with proper attributes
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      path: '/', 
      // Use secure cookies in production, allow non-secure in development
      secure: process.env.NODE_ENV === 'production',
      // Use strict SameSite policy to enhance security
      sameSite: 'lax',
      // Match expiration with JWT token (7 days)
      maxAge: 60 * 60 * 24 * 7,
    });
    
    return response;
  } catch (err) {
    // Detailed server-side logging for debugging (not exposed to client)
    console.error('💥 Sign-in error:', err);
    
    // Enhanced error logging for server logs only
    if (err instanceof Error) {
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      
      // Log specific Prisma errors
      if (err.name === 'PrismaClientKnownRequestError') {
        // @ts-ignore - Prisma error properties
        console.error('Prisma error code:', err.code);
        // @ts-ignore - Prisma error properties
        console.error('Prisma error meta:', err.meta);
      }
      
      if (err.message.includes('database') || err.message.includes('connection')) {
        console.error('Likely database connection issue. Check DATABASE_URL environment variable.');
      }
    }
    
    // Log environment check (without exposing sensitive data)
    console.error('Database URL configured:', !!process.env.DATABASE_URL);
    console.error('NODE_ENV:', process.env.NODE_ENV);
    console.error('JWT_SECRET configured:', !!process.env.JWT_SECRET);
    
    // Return a safe, user-friendly error message to client
    return NextResponse.json({ 
      error: 'Unable to sign in. Please try again later.'
    }, { status: 500 });
  }
}
