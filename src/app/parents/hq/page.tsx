export const dynamic = 'force-dynamic';

/**
 * 🔐 APA-HARDENED ROUTE: /parents-hq
 *
 * Purpose:
 *   - Entry point for parents to manage their children's permissions
 *   - Handles child invite approvals when inviteCode param is present
 *   - Renders <ParentDashboard> for normal child management
 *
 * Child Invite Flow:
 *   - /parents/hq?inviteCode=xxx → shows ChildInviteApprovalFlow
 *   - /parents/hq → shows normal ParentDashboard
 *
 * Related:
 *   - ChildInviteApprovalFlow.tsx → complete child approval interface
 *   - ParentDashboard.tsx → normal parent dashboard
 */

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ParentsHQContent from '@/components/parents/ParentsHQContent';

export default async function ParentsHQPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'Parent') {
    notFound();
  }
  
  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Parents HQ</h1>
      <Suspense fallback={
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      }>
        <ParentsHQContent />
      </Suspense>
    </main>
  );
}
