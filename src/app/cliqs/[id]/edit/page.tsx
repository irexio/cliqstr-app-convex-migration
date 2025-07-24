// 🔐 APA-HARDENED — Edit Cliq Page
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import EditCliqForm from './EditCliqForm';

export default async function EditCliqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect('/sign-in');
  }

  // Fetch the cliq
  const cliq = await prisma.cliq.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      privacy: true,
      coverImage: true,
      ownerId: true,
    },
  });

  if (!cliq) {
    notFound();
  }

  // Only the owner can edit
  if (cliq.ownerId !== user.id) {
    redirect(`/cliqs/${id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Edit Cliq</h1>
        <EditCliqForm cliq={cliq} />
      </div>
    </div>
  );
}