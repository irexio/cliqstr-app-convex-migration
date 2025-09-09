export const dynamic = 'force-dynamic';

/**
 * 🔄 OPTIMIZED CONVEX ROUTE: POST /api/verify-from-invite
 * 
 * This is the rewritten version using Convex patterns:
 * - Simplified user verification logic
 * - Uses optimized Convex mutations instead of Prisma
 * - More efficient and easier to maintain
 * 
 * The client should use:
 * - useMutation(api.users.markUserVerified, { userId }) for real-time updates
 * - This API route is kept for backward compatibility
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';

export async function POST() {
  try {
    const sessionUser = await getCurrentUser();

    if (!sessionUser?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Mark user as verified using Convex (idempotent)
    await convexHttp.mutation(api.users.markUserVerified, {
      userId: sessionUser.id as any,
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
