// 🔐 APA-Hardened: View Cliq Feed — /cliqs/[id]/page.tsx
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';
import CliqFeed from "@/components/cliqs/CliqFeed";
import CliqTools from "@/components/cliqs/CliqTools";
import CliqBanner from "@/components/cliqs/CliqBanner";

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
      _count: {
        select: { memberships: true }
      }
    },
  });

  if (!cliq) {
    return <p className="p-4">Missing cliq ID.</p>;
  }

  if (cliq.memberships.length === 0) {
    return <p className="p-4">You are not a member of this cliq.</p>;
  }

  const membership = cliq.memberships[0];
  const isOwner = membership.role === 'OWNER';

  // Transform cliq data to match CliqBanner expected types
  const cliqForBanner = {
    ...cliq,
    description: cliq.description || undefined
  };

  return (
    <div className="flex-1">
      {/* Cliq Banner */}
      <CliqBanner cliq={cliqForBanner} isOwner={isOwner} />
      
      {/* Main Content - 800px max width to match feed content */}
      <main className="max-w-[800px] mx-auto p-6">
        <CliqFeed cliqId={cliq.id} />
        <CliqTools cliqId={cliq.id} />
      </main>
    </div>
  );
}
