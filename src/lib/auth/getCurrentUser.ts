// lib/auth/getCurrentUser.ts
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * 🔐 APA-HARDENED: Retrieves the current user from a secure encrypted session cookie.
 * Uses iron-session for encrypted session management.
 * Requires Next.js 13+ App Router.
 * 
 * Note: This is a server-side only function that must be called from Server Components
 * or Route Handlers. For API routes, use getIronSession directly.
 */
export async function getCurrentUser() {
  try {
    // Import dynamically to avoid issues with server/client boundary
    const { getIronSession } = await import('iron-session');
    const { sessionOptions } = await import('@/lib/auth/session-config');
    type SessionData = { userId: string; createdAt: number };
    
    // Create a mock request object with cookies
    const cookieStore = cookies();
    const mockRequest = {
      headers: {
        cookie: cookieStore.toString(),
      },
    } as any;
    
    // Get the encrypted session
    const session = await getIronSession<SessionData>(
      mockRequest,
      new Response(),
      sessionOptions
    );

    if (!session.userId) {
      console.log('[APA] No session found');
      return null;
    }

    // Check session age (4 hour timeout for development, 30 min for production)
    const timeoutMinutes = process.env.NODE_ENV === 'production' ? 30 : 240; // 4 hours in dev
    const sessionAge = Date.now() - session.createdAt;
    if (sessionAge > timeoutMinutes * 60 * 1000) {
      console.log(`[APA] Session expired after ${Math.round(sessionAge / (60 * 1000))} minutes`);
      // Note: We can't destroy the session here in Server Components
      // The session will be invalid on next request
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        myProfile: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            image: true,
            bannerImage: true,
            about: true,
            birthdate: true,
            showYear: true,
          },
        },
        account: {
          select: {
            role: true,
            isApproved: true,
            stripeStatus: true,
            plan: true,
            stripeCustomerId: true,
            suspended: true,
            birthdate: true, // APA-safe: Immutable birthdate for age verification
          },
        },
      },
    });

    if (!user) {
      console.warn('[APA] User not found for session userId:', session.userId);
      return null;
    }

    if (user.account?.suspended) {
      console.warn('[APA] Suspended user attempted access:', session.userId);
      return null;
    }

    console.log('[APA] Authenticated user loaded:', {
      email: user.email,
      plan: user.account?.plan,
      role: user.account?.role,
      approved: user.account?.isApproved,
    });

    return {
      id: user.id,
      email: user.email,
      plan: user.account?.plan ?? null,
      role: user.account?.role ?? null,
      approved: user.account?.isApproved ?? null,
      myProfile: user.myProfile,
      account: user.account,
    };
  } catch (error) {
    console.error('[APA] Error in getCurrentUser:', error);
    return null;
  }
}