import { NextRequest, NextResponse } from 'next/server';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/admin/cliqs/[cliqId]
 * 
 * Delete a cliq (admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ cliqId: string }> }
) {
  try {
    const { cliqId } = await params;
    
    console.log(`[ADMIN_CLIQ_DELETE] Deleting cliq ${cliqId}`);
    
    await convexHttp.mutation(api.cliqs.deleteCliq, { cliqId });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ADMIN_CLIQ_DELETE] Error:', error);
    return NextResponse.json({ error: 'Failed to delete cliq' }, { status: 500 });
  }
}
