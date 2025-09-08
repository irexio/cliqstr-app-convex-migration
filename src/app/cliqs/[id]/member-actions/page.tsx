/**
 * 🔐 APA-HARDENED PAGE: /cliqs/[id]/member-actions
 * 🔄 CONVEX-OPTIMIZED: Now uses Convex for real-time member management
 * 
 * PURPOSE: Allows cliq owners to manage member roles and remove members
 * 
 * FEATURES:
 * - View all cliq members with their roles
 * - Promote members to moderators
 * - Demote moderators to members  
 * - Remove members from cliq
 * - Owner-only access with authorization checks
 * 
 * ACCESS: Only cliq owners can access this page
 * SECURITY: Owner verification, authentication required
 */
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { notFound } from 'next/navigation';
import MemberActionsContentConvex from '@/components/cliqs/MemberActionsContentConvex';

export default async function MemberActionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: cliqId } = await params;

  const user = await getCurrentUser();
  if (!user?.id) notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Manage Members</h1>
      <MemberActionsContentConvex cliqId={cliqId} currentUserId={user.id} />
    </main>
  );
}
