/**
 * 🔐 APA-HARDENED — Cliq Invite Page
 * 🔄 CONVEX-OPTIMIZED: Now uses Convex for real-time cliq data
 * 
 * PURPOSE: Allows cliq owners and members to invite new people to join the cliq
 * 
 * FEATURES:
 * - Invite people via email to join the cliq
 * - Owner can invite anyone to any cliq
 * - Members can invite to public cliqs
 * - Child invite approval flow (if enabled by parents)
 * - Email validation and duplicate invite prevention
 * 
 * ACCESS: 
 * - Cliq owners: Can invite to any cliq
 * - Cliq members: Can invite to public cliqs only
 * - Non-members: Blocked from private/semi-private cliqs
 * 
 * SECURITY: Authentication required, cliq privacy checks
 */
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import InviteClient from '@/components/InviteClient';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { enforceAPA } from '@/lib/auth/enforceAPA';
import InvitePageContentConvex from '@/components/cliqs/InvitePageContentConvex';

export default async function InvitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  enforceAPA(user);
  if (!id) notFound();

  return (
    <InvitePageContentConvex cliqId={id} currentUserId={user.id} />
  );
}
