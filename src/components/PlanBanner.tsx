'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * PlanBanner - Shows a notification banner when user needs to select a plan
 * This component is used in the root layout to show a consistent message
 * across all pages when a user needs to select a plan
 */
export default function PlanBanner() {
  const [needsPlan, setNeedsPlan] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUserPlan() {
      try {
        // Try to fetch user status
        const res = await fetch('/api/auth/status', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          credentials: 'include',
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log('[PlanBanner] User data:', data);
          
          // Check if user is logged in and needs a plan
          if (data.user) {
            // Check both user.plan and user.account.plan
            const hasPlan = 
              (data.user.plan && data.user.plan !== null) || 
              (data.user.account && data.user.account.plan && data.user.account.plan !== null);
              
            if (!hasPlan) {
              console.log('[PlanBanner] User needs to select a plan');
              setNeedsPlan(true);
            } else {
              console.log('[PlanBanner] User has a plan:', data.user.plan || data.user.account?.plan);
              setNeedsPlan(false);
            }
          } else {
            // Not logged in
            setNeedsPlan(false);
          }
        }
      } catch (error) {
        console.error('[PlanBanner] Error checking user plan:', error);
      } finally {
        setLoading(false);
      }
    }
    
    checkUserPlan();
  }, []);

  // Don't render anything while loading to avoid flash of content
  if (loading) return null;
  
  // Check if we're on pages where we shouldn't show the banner
  const isOnDashboard = typeof window !== 'undefined' && window.location.pathname.includes('/my-cliqs-dashboard');
  const isOnVerificationPage = typeof window !== 'undefined' && (
    window.location.pathname.includes('/verify-email') ||
    window.location.pathname.includes('/verification-success') ||
    window.location.pathname.includes('/verification-error') ||
    window.location.pathname.includes('/awaiting-approval')
  );
  const isOnSignupFlow = typeof window !== 'undefined' && (
    window.location.pathname.includes('/sign-up') ||
    window.location.pathname.includes('/sign-in') ||
    window.location.pathname.includes('/choose-plan')
  );
  
  // Don't show banner on dashboard, verification pages, or if user doesn't need a plan
  if (!needsPlan || isOnDashboard || isOnVerificationPage || isOnSignupFlow) return null;

  return (
    <div className="w-full bg-red-50 text-center py-3 px-4 text-red-700">
      <span className="font-medium">Oops! It looks like you haven't selected a plan yet.</span>{' '}
      <Link href="/choose-plan" className="underline font-medium">Please click here to choose your plan</Link>.
    </div>
  );
}
