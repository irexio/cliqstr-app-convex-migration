export const dynamic = 'force-dynamic';

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
import { hash } from 'bcryptjs';

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
        myProfile: {
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

// POST: create a child and link to parent
export async function POST(req: Request) {
  try {
    const parent = await getCurrentUser();
    if (!parent?.id || !parent?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { username, password } = await req.json().catch(() => ({}));
    if (!username || !password) {
      return NextResponse.json({ ok: false, reason: 'missing_fields' }, { status: 400 });
    }

    const hashed = await hash(password, 10);

    try {
      const child = await prisma.$transaction(async (tx) => {
        // Create child user with synthetic email pattern
        const newUser = await tx.user.create({
          data: {
            email: `${username}@child.cliqstr`,
            password: hashed,
            isVerified: true, // parent-created accounts considered verified for login-less child
          },
        });

        // Minimal profile with required unique username
        await tx.myProfile.create({
          data: {
            userId: newUser.id,
            username,
            // Placeholder DOB if schema requires it; adjust if real DOB is collected elsewhere
            birthdate: new Date(2008, 0, 1),
          },
        });

        // Link to parent (store both parentId and email to match existing queries)
        await tx.parentLink.create({
          data: {
            parentId: parent.id,
            email: parent.email,
            childId: newUser.id,
            type: 'family',
          },
        });

        return newUser;
      });

      console.log('[PARENT/CHILDREN/CREATE]', { parentId: parent.id, childId: child.id });
      const res = NextResponse.json({ id: child.id });
      res.headers.set('Cache-Control', 'no-store');
      return res;
    } catch (err: any) {
      // Handle unique constraint violation for username or email
      if (err?.code === 'P2002') {
        return NextResponse.json({ ok: false, reason: 'conflict' }, { status: 409 });
      }
      throw err;
    }
  } catch (err) {
    console.error('[PARENT/CHILDREN][POST] error', err);
    return NextResponse.json({ ok: false, reason: 'server_error' }, { status: 500 });
  }
}
