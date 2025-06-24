// 🔐 APA-HARDENED — Create post in specific cliq
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/getServerSession';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  content: z.string().optional(),
  image: z.string().url().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session || !session.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const cliqId = params.id;
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { content, image } = parsed.data;

  if (!content && !image) {
    return NextResponse.json({ error: 'Post must include content or image.' }, { status: 400 });
  }

  try {
    const post = await prisma.post.create({
      data: {
        content: content || '',
        image: image || null,
        cliqId,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(post);
  } catch (err) {
    console.error('❌ Error creating post:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
