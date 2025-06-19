import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const formData = await req.formData();

  const cliqId = formData.get('cliqId')?.toString();
  const content = formData.get('content')?.toString();
  const imageUrl = formData.get('imageUrl')?.toString() || null;

  if (!cliqId || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // TODO: Replace with real authenticated user ID once auth is wired in
  const currentUserId = 'mock-user-123';

  try {
    await prisma.post.create({
      data: {
        content,
        imageUrl,
        cliqId,
        authorId: currentUserId,
        // Optional: createdAt will be handled by Prisma unless you want to add:
        // createdAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
