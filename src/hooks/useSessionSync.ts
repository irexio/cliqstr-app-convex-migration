/**
 * React Hook for Session Synchronization
 * Automatically handles session state across browser tabs
 */

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { sessionSync } from '@/lib/auth/session-sync';

export function useSessionSync() {
  const router = useRouter();

  // Handle auth state changes
  const handleAuthChange = useCallback((isAuthenticated: boolean) => {
    if (!isAuthenticated) {
      // Check if we're on the /parents route - don't auto-redirect there
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/parents')) {
        console.log('[SessionSync] Skipping auto-redirect on /parents route');
        return;
      }
      
      // User signed out in another tab - redirect to sign in
      router.push('/sign-in');
    }
  }, [router]);

  useEffect(() => {
    // Start monitoring session state
    sessionSync.startMonitoring();
    
    // Add listener for auth changes
    sessionSync.addListener(handleAuthChange);

    // Cleanup on unmount
    return () => {
      sessionSync.removeListener(handleAuthChange);
      // Don't stop monitoring here - let it continue for other components
    };
  }, [handleAuthChange]);

  // Return utility functions
  return {
    signOutAllTabs: sessionSync.signOutAllTabs.bind(sessionSync),
  };
}
