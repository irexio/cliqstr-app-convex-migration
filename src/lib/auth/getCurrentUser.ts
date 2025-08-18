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
    const { sessionOptions, SessionData } = await import('@/lib/auth/session-config');
    
    // Get cookieStore directly - compatible with how parent-signup saves the session
    const cookieStore = await cookies();
    
    // Get the encrypted session using cookieStore directly (same as parent-signup route)
    const session = await getIronSession<SessionData>(
      cookieStore as any,
      sessionOptions
    );

    if (!session.userId) {
      console.log('[APA] No session found');
      return null;
    }

    // Check session expiration using the new session format
    const now = Date.now();
    
    // Check if session has expired based on expiresAt field
    if (session.expiresAt && session.expiresAt < now) {
      console.log(`[APA] Session expired at ${new Date(session.expiresAt).toISOString()}`);
      return null;
    }
    
    // Check idle timeout
    const idleTimeMs = session.idleCutoffMinutes ? session.idleCutoffMinutes * 60 * 1000 : 60 * 60 * 1000; // Default 1 hour
    if (session.lastActivityAt && (now - session.lastActivityAt) > idleTimeMs) {
      console.log(`[APA] Session idle timeout exceeded`);
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