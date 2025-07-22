// 🔐 APA-HARDENED SESSION PING PAGE
// This page ensures session cookies are properly recognized before redirecting

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export const dynamic = 'force-dynamic';

export default async function SessionPingPage() {
  const user = await getCurrentUser();

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
  if (user.approved === true || user.account?.isApproved === true) {
    console.log('[APA] User is approved. Redirecting directly to dashboard.');
    redirect('/my-cliqs-dashboard');
  }
  
  // For test plan users, redirect to email-confirmation per APA flow document
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
  redirect('/my-cliqs-dashboard');
  
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
