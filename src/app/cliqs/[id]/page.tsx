// 🔄 OPTIMIZED CONVEX: View Cliq Feed — /cliqs/[id]/page.tsx
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import CliqPageConvex from "@/components/cliqs/CliqPageConvex";
import { guardPendingChildToAwaitingApproval } from '@/lib/guards';

export default async function CliqPage({ params }: { params: Promise<{ id: string }> }) {
  await guardPendingChildToAwaitingApproval();
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user?.id) return <p className="p-4">Unauthorized</p>;

  return (
    <CliqPageConvex cliqId={id} currentUser={user} />
  );
}