import { NextRequest, NextResponse } from 'next/server';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/cliqs
 * 
 * Get all cliqs for admin management
 */
export async function GET(req: NextRequest) {
  try {
    // Get all cliqs from Convex
    const cliqs = await convexHttp.query(api.cliqs.getAllCliqs, {});
    
    return NextResponse.json({ items: cliqs });
  } catch (error) {
    console.error('[ADMIN_CLIQS] Error fetching cliqs:', error);
    return NextResponse.json({ error: 'Failed to fetch cliqs' }, { status: 500 });
  }
}
