// 🔐 APA-Hardened: View Cliq Feed — /cliqs/[id]/page.tsx
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';
import CliqFeed from "@/components/cliqs/CliqFeed";
import CliqTools from "@/components/cliqs/CliqTools";

export default async function CliqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user?.id) return <p className="p-4">Unauthorized</p>;

  const cliq = await prisma.cliq.findUnique({
    where: { id },
    include: {
      memberships: {
        where: { userId: user.id },
      },
      posts: {
        where: { deleted: false },
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              myProfile: true,
            }
          }
        },
      },
    },
  });

  if (!cliq) {
    return <p className="p-4">Missing cliq ID.</p>;
  }

  if (cliq.memberships.length === 0) {
    return <p className="p-4">You are not a member of this cliq.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">{cliq.name}</h1>
      <CliqFeed cliqId={cliq.id} />
      <CliqTools cliqId={cliq.id} />
    </div>
  );
}
