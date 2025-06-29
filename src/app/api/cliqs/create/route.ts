// 🔐 APA-HARDENED — Create a new cliq
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/getServerSession';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  privacy: z.enum(['private', 'semi', 'public']),
  coverImage: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { name, description, privacy, coverImage } = parsed.data;

  const cliq = await prisma.cliq.create({
    data: {
      name,
      description,
      privacy,
      coverImage,
      ownerId: session.user.id,
    },
  });

  return NextResponse.json({ cliq });
}
