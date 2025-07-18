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
          if (data.isAuthenticated && 
             (!data.user?.account?.plan || data.user?.account?.plan === null || data.user?.account?.plan === undefined)) {
            console.log('[PlanBanner] User needs to select a plan');
            setNeedsPlan(true);
          } else {
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
  
  // Only show banner if user needs to select a plan
  if (!needsPlan) return null;

  return (
    <div className="w-full bg-red-50 text-center py-2 px-4 text-red-700">
      No plan selected. <Link href="/choose-plan" className="underline font-medium">Choose a plan</Link>.
    </div>
  );
}
