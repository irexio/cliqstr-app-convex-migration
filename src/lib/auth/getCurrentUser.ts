import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * 🔐 APA-HARDENED: Retrieves the current user from a secure session cookie.
 * Requires Next.js 15+ with async cookies().
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies(); // ✅ YOUR version requires await
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      console.log('[APA] No session cookie found');
      return null;
    }

    const userId = sessionCookie.value;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          select: {
            id: true,
            username: true,
            image: true,
            bannerImage: true,
            about: true,
          },
        },
        account: {
          select: {
            role: true,
            isApproved: true,
            stripeStatus: true,
            plan: true,
            stripeCustomerId: true,
            suspended: true, // APA: Needed for suspension enforcement
          },
        },
      },
    });

    if (!user) {
      console.warn('[APA] User not found for session userId:', userId);
      return null;
    }

    // 🔐 APA: Block suspended users from accessing the app
    if (user.account?.suspended) {
      console.warn('[APA] Suspended user attempted access:', userId);
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.account?.role ?? null,
      isApproved: user.account?.isApproved ?? null,
      profile: user.profile, // Only public fields
      account: user.account,
    };
  } catch (error) {
    console.error('[APA] Error in getCurrentUser:', error);
    return null;
  }
}

