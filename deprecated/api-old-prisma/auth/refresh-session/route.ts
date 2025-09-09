// 🔄 APA-COMPLIANT SESSION REFRESH ENDPOINT
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Standardized user shape for consistent client-side handling
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      plan: user.account?.plan ?? null,
      role: user.account?.role ?? null,
      // Check account first, then fall back to user if needed
      approved: user.account?.isApproved,
    }
  });
}
