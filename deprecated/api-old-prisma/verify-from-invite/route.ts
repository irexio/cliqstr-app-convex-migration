/**
 * 🚨 DEPRECATED: This route has been rewritten with Convex optimizations
 * 
 * Use: /api/verify-from-invite/route-convex.ts instead
 * 
 * The new version:
 * - Simplified user verification logic
 * - Uses optimized Convex mutations instead of Prisma
 * - More efficient and easier to maintain
 * 
 * @deprecated Use route-convex.ts instead
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function POST() {
  try {
    const sessionUser = await getCurrentUser();

    if (!sessionUser?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Idempotent: safe if already true
    await prisma.user.update({
      where: { id: sessionUser.id },
      data: { isVerified: true },
    });

    console.log('[VERIFY/INVITE]', { userId: sessionUser.id, isVerified: true });

    const res = NextResponse.json({ ok: true });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (err) {
    console.error('[VERIFY/INVITE] error', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
