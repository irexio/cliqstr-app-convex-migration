import { NextRequest, NextResponse } from 'next/server';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/promote
 * 
 * Temporary endpoint to promote a user to admin role
 * This should be removed after setting up admin access
 */
export async function POST(req: NextRequest) {
  try {
    const { email, secret } = await req.json();
    
    // Simple secret check (you can change this)
    if (secret !== 'cliqstr-admin-2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }
    
    console.log(`[ADMIN_PROMOTE] Promoting ${email} to admin...`);
    
    // Try to promote existing user to admin
    try {
      const result = await convexHttp.mutation(api.users.promoteToAdmin, {
        email: email.toLowerCase()
      });
      
      return NextResponse.json({ 
        success: true, 
        message: `Successfully promoted ${email} to admin`,
        result 
      });
    } catch (error: any) {
      if (error.message === 'User not found') {
        return NextResponse.json({ 
          error: 'User not found. Please sign up first, then run this promotion.' 
        }, { status: 404 });
      }
      throw error;
    }
    
  } catch (error) {
    console.error('[ADMIN_PROMOTE] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to promote user to admin' 
    }, { status: 500 });
  }
}
