/**
 * 🔐 APA-HARDENED ROUTE: GET /api/parent/children
 *
 * Purpose:
 *   - Returns all child profiles linked to the currently authenticated parent
 *   - Used to populate the dropdown in ParentDashboard
 *
 * Auth:
 *   - Requires a logged-in parent user (validated via email)
 *   - Matches children via ParentLink table (email ↔ childId)
 *
 * Returns:
 *   - 200 OK with array of child profiles: [{ id, name?, email? }]
 *   - 401 if not authenticated
 *   - 500 on server error
 *
 * Used In:
 *   - ParentDashboard.tsx (child selector for ParentsHQPage)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET() {
  try {
    const parent = await getCurrentUser();

    if (!parent?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const links = await prisma.parentLink.findMany({
      where: { email: parent.email },
    });

    const childIds = links.map((link) => link.childId);

    const children = await prisma.user.findMany({
      where: { id: { in: childIds } },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            username: true
          }
        }
      },
    });

    return NextResponse.json(children);
  } catch (err) {
    console.error('[GET_PARENT_CHILDREN_ERROR]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
