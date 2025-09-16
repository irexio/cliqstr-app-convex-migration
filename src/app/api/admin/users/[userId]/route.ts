import { NextRequest, NextResponse } from 'next/server';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/users/[userId]
 * 
 * Update user status (approve, suspend, delete, etc.)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { action } = await req.json();
    
    console.log(`[ADMIN_USER_ACTION] ${action} for user ${userId}`);
    
    const userIdTyped = userId as Id<"users">;
    
    switch (action) {
      case 'approve':
        await convexHttp.mutation(api.users.approveUser, { userId: userIdTyped });
        break;
      case 'deactivate':
        await convexHttp.mutation(api.users.deactivateUser, { userId: userIdTyped });
        break;
      case 'suspend':
        await convexHttp.mutation(api.users.suspendUser, { userId: userIdTyped });
        break;
      case 'unsuspend':
        await convexHttp.mutation(api.users.unsuspendUser, { userId: userIdTyped });
        break;
      case 'soft_delete':
        await convexHttp.mutation(api.users.softDeleteUser, { userId: userIdTyped });
        break;
      case 'hard_delete':
        await convexHttp.mutation(api.users.hardDeleteUser, { userId: userIdTyped });
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ADMIN_USER_ACTION] Error:', error);
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
}
