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
  
  if (!user.plan) {
    console.log('[APA] User missing plan. Redirecting to choose-plan.');
    redirect('/choose-plan');
  }
  
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
