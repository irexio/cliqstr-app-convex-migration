/**
 * 🔐 APA-HARDENED ROUTE: GET /api/cliqs?id={cliqId}
 *
 * Purpose:
 *   - Returns public info about a cliq based on the query parameter
 *   - Used when viewing cliq details safely without revealing private data
 *
 * Auth:
 *   - Requires user to be logged in
 *   - Requires user to be a member of the cliq
 *
 * Query Param:
 *   - id: string (cliq ID)
 *
 * Returns:
 *   - 200 OK with cliq summary info
 *   - 401 if unauthenticated or missing cliq ID
 *   - 403 if user is not a member of the cliq
 *   - 404 if cliq does not exist
 *   - 500 on server error
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cliqId = searchParams.get('id');
    const user = await getCurrentUser();

    if (!user?.id || !cliqId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 🔒 Security check: User must have a valid plan to access cliqs
    if (!user.plan) {
      console.error('[SECURITY] User attempted to access cliq without plan:', {
        userId: user.id,
        email: user.email,
        cliqId
      });
      return NextResponse.json({ error: 'Account setup incomplete - no plan assigned' }, { status: 403 });
    }

    // Use Convex to get cliq data (includes membership check)
    try {
      const cliq = await convexHttp.query(api.cliqs.getCliq, {
        cliqId: cliqId as any, // Convert string to Convex ID
        userId: user.id as any, // Convert string to Convex ID
      });

      return NextResponse.json({ cliq });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Not authorized')) {
        return NextResponse.json({ error: 'Not authorized to access this cliq' }, { status: 403 });
      }
      if (error instanceof Error && error.message.includes('not found')) {
        return NextResponse.json({ error: 'Cliq not found' }, { status: 404 });
      }
      throw error;
    }
  } catch (err) {
    console.error('❌ Error fetching cliq:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
