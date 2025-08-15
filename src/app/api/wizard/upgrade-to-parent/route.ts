import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/getServerSession';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Auth: user must be authenticated
    const session = await getServerSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get user's current account
    const account = await prisma.account.findFirst({
      where: { userId: session.id }
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (account.role === 'Parent') {
      return NextResponse.json({ error: 'Already a parent account' }, { status: 400 });
    }

    if (account.role === 'Child') {
      return NextResponse.json({ error: 'Child accounts cannot become parents' }, { status: 400 });
    }

    // Upgrade to Parent role
    await prisma.account.update({
      where: { id: account.id },
      data: {
        role: 'Parent',
        isApproved: true, // Parents are auto-approved
      }
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('[UPGRADE_TO_PARENT] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
