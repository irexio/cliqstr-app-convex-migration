export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      username,
      birthdate,
      image,          // avatar
      bannerImage,    // 🆕 banner
      inviteCode,
      invitedRole,
      cliqId,
    } = body;

    if (!userId || !username || !birthdate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 🧠 Parse birthdate safely
    const parsedBirthdate = new Date(birthdate);
    if (isNaN(parsedBirthdate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid birthdate' },
        { status: 400 }
      );
    }

    // 🧩 Step 1: Confirm user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ✅ Step 2: Update the profile
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        username,
        birthdate: parsedBirthdate,
        image,       // avatar image URL
        bannerImage, // 🆕 banner image URL
        // Optional: inviteCode, invitedRole, cliqId — add if supported in schema
      },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
