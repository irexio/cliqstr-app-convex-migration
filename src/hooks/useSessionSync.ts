"use client";
/**
 * React Hook for Session Synchronization
 * Automatically handles session state across browser tabs
 */

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { sessionSync } from '@/lib/auth/session-sync';

export function useSessionSync(session: any) {
  const pathname = usePathname() || "";
  const search = useSearchParams();

  // Blocklist: never auto-redirect on these paths
  const blockOnPath =
    pathname.startsWith("/parents") ||    // Parents HQ + any nested
    pathname.startsWith("/invite");       // invite accept flow landing

  // Treat invite flow as active if cookie exists or #create-child anchor present
  // (We can't read httpOnly cookies here; so also use a query or hash signal if present.)
  const anchorHasCreateChild = (typeof window !== "undefined") && window.location.hash.includes("create-child");
  const inviteFlowActive =
    blockOnPath || anchorHasCreateChild || search?.get("invite") === "1";

  useEffect(() => {
    // ✅ NEVER force sign-in while on Parents HQ or invite flow
    if (inviteFlowActive) {
      console.log("[SessionSync] Skip auth redirect (Parents/Invite flow)");
      return;
    }

    // Start monitoring session state only if not in invite flow
    sessionSync.startMonitoring();
    
    // Handle auth state changes
    const handleAuthChange = (isAuthenticated: boolean) => {
      if (!isAuthenticated) {
        // User signed out in another tab - redirect to sign in
        window.location.href = '/sign-in';
      }
    };

    // Add listener for auth changes
    sessionSync.addListener(handleAuthChange);

    // Cleanup on unmount
    return () => {
      sessionSync.removeListener(handleAuthChange);
      // Don't stop monitoring here - let it continue for other components
    };
  }, [inviteFlowActive, session]);

  // Return utility functions
  return {
    signOutAllTabs: sessionSync.signOutAllTabs.bind(sessionSync),
  };
}
