'use client';

import { useSearchParams } from 'next/navigation';
import ParentDashboard from './ParentDashboard';
import ChildInviteApprovalFlow from './ChildInviteApprovalFlow';

/**
 * 🔐 APA-HARDENED COMPONENT: ParentsHQContent
 * 
 * Purpose:
 *   - Detects inviteCode parameter to determine which UI to show
 *   - Shows ChildInviteApprovalFlow for child invite approvals
 *   - Shows ParentDashboard for normal parent management
 * 
 * Flow:
 *   - /parents/hq?inviteCode=xxx → ChildInviteApprovalFlow
 *   - /parents/hq → ParentDashboard
 */
export default function ParentsHQContent() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('inviteCode');

  // If inviteCode is present, show child invite approval flow
  if (inviteCode) {
    console.log('[APA] Child invite approval flow - inviteCode:', inviteCode);
    return <ChildInviteApprovalFlow inviteCode={inviteCode} />;
  }

  // Otherwise, show normal parent dashboard
  console.log('[APA] Normal parent dashboard view');
  return <ParentDashboard />;
}
