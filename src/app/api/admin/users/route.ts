import { NextRequest, NextResponse } from 'next/server';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/users
 * 
 * Get all users for admin management
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    
    // Get all users from Convex
    const users = await convexHttp.query(api.users.getAllUsers, {
      role: role && role !== 'All' ? role : undefined
    });
    
    return NextResponse.json({ items: users });
  } catch (error) {
    console.error('[ADMIN_USERS] Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
