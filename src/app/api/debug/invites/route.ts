import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get all invites with their details
    const invites = await prisma.invite.findMany({
      select: {
        id: true,
        code: true,
        recipientEmail: true,
        role: true,
        status: true,
        createdAt: true,
        expiresAt: true,
        cliq: {
          select: {
            name: true,
            ownerId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Last 20 invites
    });

    // Get all users to see existing accounts
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        account: {
          select: {
            role: true,
            plan: true,
            isApproved: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Last 10 users
    });

    return NextResponse.json({
      invites,
      users,
      summary: {
        totalInvites: invites.length,
        totalUsers: users.length,
        pendingInvites: invites.filter(i => i.status === 'pending').length,
        acceptedInvites: invites.filter(i => i.status === 'accepted').length
      }
    });

  } catch (error) {
    console.error('Debug invites error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
