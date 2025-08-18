/**
 * 🔔 APA-HARDENED ROUTE: GET /api/cliqs/[id]/notices
 *
 * Purpose:
 *   - Fetches active notices for a specific cliq
 *   - Auto-generates birthday notices based on MyProfile.birthdate
 *   - Filters expired notices automatically
 *   - Only accessible to cliq members (APA-safe)
 *
 * Auth:
 *   - Requires valid session (user.id)
 *   - User must be a member of the cliq
 *
 * Returns:
 *   - 200 OK + array of active notices
 *   - 401 if unauthorized
 *   - 403 if not a cliq member
 *   - 404 if cliq not found
 *   - 500 on error
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cliqId } = await params;
    
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 🔒 Security check: User must have a valid plan to access notices
    if (!user.plan) {
      console.error('[SECURITY] User attempted to access cliq notices without plan:', {
        userId: user.id,
        email: user.email,
        cliqId
      });
      return NextResponse.json({ error: 'Account setup incomplete - no plan assigned' }, { status: 403 });
    }

    // Verify user is a member of this cliq (APA-safe)
    const membership = await prisma.membership.findFirst({
      where: {
        userId: user.id,
        cliqId: cliqId
      }
    });

    if (!membership) {
      return NextResponse.json({ 
        error: 'Access denied: You are not a member of this cliq' 
      }, { status: 403 });
    }

    // Get current time for expiration filtering
    const now = new Date();

    // Fetch active notices (not expired)
    const notices = await prisma.cliqNotice.findMany({
      where: {
        cliqId: cliqId,
        OR: [
          { expiresAt: null }, // Never expires
          { expiresAt: { gt: now } } // Not yet expired
        ]
      },
      orderBy: [
        { type: 'asc' }, // red_alert_open first, then others
        { createdAt: 'desc' }
      ]
    });

    // Auto-generate birthday notices for cliq members
    const birthdayNotices = await generateBirthdayNotices(cliqId);

    // Combine and deduplicate notices
    const allNotices = [...notices, ...birthdayNotices];
    
    // Remove duplicates based on content (in case birthday notice already exists)
    const uniqueNotices = allNotices.filter((notice, index, self) => 
      index === self.findIndex(n => n.content === notice.content)
    );

    console.log(`[CLIQ_NOTICES] Fetched ${uniqueNotices.length} notices for cliq ${cliqId}`);
    
    return NextResponse.json({ 
      notices: uniqueNotices,
      count: uniqueNotices.length
    });

  } catch (error) {
    console.error('[CLIQ_NOTICES_ERROR]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * 🎂 Generate birthday notices for cliq members
 * Based on MyProfile.birthdate (social display, not security)
 */
async function generateBirthdayNotices(cliqId: string) {
  try {
    const now = new Date();
    const currentWeek = getWeekRange(now);

    // Get all cliq members with profiles
    const members = await prisma.membership.findMany({
      where: { cliqId },
      include: {
        user: {
          include: {
            myProfile: {
              select: {
                username: true,
                birthdate: true,
                showYear: true
              }
            }
          }
        }
      }
    });

    const birthdayNotices = [];

    for (const member of members) {
      const profile = member.user.myProfile;
      if (!profile?.birthdate) continue;

      const birthday = new Date(profile.birthdate);
      const thisYearBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());

      // Check if birthday is this week
      if (thisYearBirthday >= currentWeek.start && thisYearBirthday <= currentWeek.end) {
        birthdayNotices.push({
          id: `birthday-${member.userId}-${now.getFullYear()}`,
          cliqId,
          type: 'birthday',
          content: `🎉 This week is ${profile.username}'s birthday! Drop them some birthday wishes in the cliq.`,
          createdAt: now.toISOString(),
          expiresAt: currentWeek.end.toISOString()
        });
      }
    }

    return birthdayNotices;
  } catch (error) {
    console.error('[BIRTHDAY_NOTICES_ERROR]', error);
    return [];
  }
}

/**
 * Get the start and end of the current week (Sunday to Saturday)
 */
function getWeekRange(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day; // Adjust to Sunday
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Saturday
  end.setHours(23, 59, 59, 999);

  return { start, end };
}
