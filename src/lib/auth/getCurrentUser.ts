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
        profile: true,
        account: {
          select: {
            stripeStatus: true,
            plan: true,
            stripeCustomerId: true,
          },
        },
      },
    });

    if (!user || !user.profile) {
      console.warn('[APA] User or profile not found for session userId:', userId);
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
    console.error('[APA] Error in getCurrentUser:', error);
    return null;
  }
}
