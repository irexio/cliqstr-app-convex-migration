// 🔐 APA-HARDENED — Cliq Invite Page - 070325
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import InviteClient from '@/components/InviteClient';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';

export default async function InvitePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!id || !user?.id) {
    notFound();
  }

  const cliq = await prisma.cliq.findUnique({
    where: { id },
    select: { ownerId: true, privacy: true, name: true },
  });

  if (!cliq) notFound();

  const isOwner = cliq.ownerId === user.id;
  if (!isOwner && cliq.privacy !== 'public') notFound();

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Invite Someone to {cliq.name}</h1>
      <InviteClient cliqId={id} />
    </div>
  );
}
