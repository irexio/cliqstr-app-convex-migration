import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from './jwt';

export async function getCurrentUser() {
  try {
    // In Next.js 15+, cookies() returns a Promise<ReadonlyRequestCookies>
    const cookieStore = await cookies(); // Must await in Next.js 15+
    
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      console.log('No auth_token cookie found');
      return null;
    }
    
    const payload = verifyToken(token);
    if (!payload?.userId) {
      console.error('Invalid token payload or missing userId:', payload);
      return null;
    }
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { 
        profile: true,
        account: {
          select: {
            stripeStatus: true,
            plan: true,
            stripeCustomerId: true,
          }
        },
      },
    });
    
    if (!user) {
      console.error(`User not found with id ${payload.userId}`);
      return null;
    }
    
    if (!user.profile) {
      console.error(`Profile not found for user ${user.id}`);
      return null;
    }
    
    return {
      id: user.id,
      email: user.email,
      role: user.profile.role,
      isApproved: user.profile.isApproved,
      profile: user.profile,
      account: user.account,
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}
