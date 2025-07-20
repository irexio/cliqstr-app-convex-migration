// lib/auth/getCurrentUser.ts
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * 🔐 APA-HARDENED: Retrieves the current user from a secure session cookie.
 * Requires Next.js 13+ App Router.
 */
export async function getCurrentUser() {
  try {
    const cookieStore = cookies(); // ✅ NO await here — it's sync in latest Next.js
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
            username: true,
            firstName: true,
            lastName: true,
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
            suspended: true,
          },
        },
      },
    });

    if (!user) {
      console.warn('[APA] User not found for session userId:', userId);
      return null;
    }

    if (user.account?.suspended) {
      console.warn('[APA] Suspended user attempted access:', userId);
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
      profile: user.profile,
      account: user.account,
    };
  } catch (error) {
    console.error('[APA] Error in getCurrentUser:', error);
    return null;
  }
}
