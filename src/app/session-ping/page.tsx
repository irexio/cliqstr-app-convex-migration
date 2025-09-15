// 🔐 APA-HARDENED SESSION PING PAGE
// This page ensures session cookies are properly recognized before redirecting

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export const dynamic = 'force-dynamic';

export default async function SessionPingPage({ searchParams }: { searchParams: { inviteCode?: string, code?: string, from?: string } }) {
  const user = await getCurrentUser();
  const inviteCode = searchParams.inviteCode || searchParams.code;
  const fromParentsHQ = searchParams.from === 'parents-hq';

  // 🚨 SOL'S FIX: Don't hijack users in Parents HQ invite flow
  // Only protect Parent invite flows - preserve adult/child flows
  if (fromParentsHQ) {
    console.log('[APA] Parents HQ invite flow detected. Redirecting back to Parents HQ.');
    redirect(`/parents/hq${inviteCode ? `?code=${inviteCode}` : ''}`);
  }

  if (!user) {
    console.log('[APA] No session found in session-ping. Redirecting to sign-in.');
    redirect('/sign-in');
  }
  
  // Log full user state for debugging
  console.log('[APA] User state in session-ping:', {
    id: user.id,
    email: user.email,
    plan: user.plan,
    approved: user.approved,
    role: user.role,
    accountApproval: user.account?.isApproved
  });

  // If user is approved (check both user.approved and account.isApproved), send them directly to dashboard
  // BUT preserve invite codes for parent approval flows
  if (user.approved === true || user.account?.isApproved === true) {
    // Check if user has a profile - if not, redirect to profile creation
    if (!user.myProfile) {
      console.log('[APA] User is approved but has no profile. Redirecting to profile creation.');
      redirect('/profile/create');
    }
    
    if (inviteCode) {
      console.log('[APA] User is approved but has invite code. Redirecting to invite flow.');
      redirect(`/invite/accept?code=${inviteCode}`);
    } else {
      console.log('[APA] User is approved. Redirecting directly to dashboard.');
      redirect('/my-cliqs-dashboard');
    }
  }
  
  // Sol's Fix: Check for approved Parents first (parent invite flow)
  if (user.account?.isApproved && user.account?.role === 'Parent') {
    console.log('[APA] Approved Parent detected. Allowing access to dashboard or invite flow.');
    // Let the parent continue - don't force them through email-confirmation
    if (inviteCode) {
      redirect(`/invite/accept?code=${inviteCode}`);
    } else {
      redirect('/my-cliqs-dashboard');
    }
  }
  
  // For test plan users (non-parents), redirect to email-confirmation per APA flow document
  if (user.plan === 'test') {
    console.log('[APA] Test plan user detected. Redirecting to email-confirmation per APA flow document.');
    redirect('/email-confirmation');
  }
  
  // If user has no plan, redirect to choose-plan
  if (!user.plan) {
    console.log('[APA] User missing plan. Redirecting to choose-plan.');
    redirect('/choose-plan');
  }
  
  // For non-test plans with no explicit approval, redirect to choose-plan
  console.log('[APA] User not approved. Redirecting to choose-plan.');
  redirect('/choose-plan');
  
  console.log('[APA] Session confirmed. Redirecting to dashboard.');
  if (inviteCode) {
    redirect(`/invite/accept?code=${inviteCode}`);
  } else {
    redirect('/my-cliqs-dashboard');
  }
  
  // This will never render, but added for completeness
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-xl font-bold mb-4">Verifying your session...</h1>
        <div className="inline-block w-8 h-8 border-4 border-t-black border-r-black border-gray-300 rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
