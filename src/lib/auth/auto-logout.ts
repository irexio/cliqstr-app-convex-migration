/**
 * Auto-Logout Utility for APA Compliance
 * 
 * Implements role-based inactivity timeouts:
 * - Child: 30 minutes
 * - Adult/Parent/Admin: 60 minutes
 * 
 * This utility tracks user activity and automatically logs out users
 * after the specified period of inactivity.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Timeout durations in milliseconds
const TIMEOUT_CHILD = 30 * 60 * 1000; // 30 minutes
const TIMEOUT_ADULT = 60 * 60 * 1000; // 60 minutes

// Activity events to monitor
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
  'focus'
];

export function useAutoLogout(userRole?: string) {
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Determine timeout based on role
  const getTimeoutForRole = (role?: string): number => {
    if (!role) return TIMEOUT_ADULT; // Default to adult timeout
    return role === 'Child' ? TIMEOUT_CHILD : TIMEOUT_ADULT;
  };

  // Update last activity timestamp
  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  // Check for inactivity and log out if needed
  const checkInactivity = () => {
    const currentTime = Date.now();
    const timeoutDuration = getTimeoutForRole(userRole);
    
    if (currentTime - lastActivity > timeoutDuration) {
      // Clear session and redirect to login
      handleLogout();
    }
  };

  // Handle logout process
  const handleLogout = async () => {
    try {
      // Call sign-out API
      await fetch('/api/sign-out', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Redirect to sign-in page with message
      router.push('/sign-in?message=You+were+logged+out+for+your+safety');
    } catch (error) {
      console.error('Auto-logout error:', error);
      // Fallback direct redirect
      router.push('/sign-in?message=You+were+logged+out+for+your+safety');
    }
  };

  // Set up activity tracking and inactivity timer
  useEffect(() => {
    // Skip for unauthenticated states
    if (!userRole) return;

    // Activity event handlers
    const activityHandler = () => {
      updateActivity();
    };

    // Add event listeners
    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, activityHandler);
    });

    // Set up periodic check
    const inactivityInterval = setInterval(checkInactivity, 60000); // Check every minute
    setTimer(inactivityInterval);

    // Clean up
    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, activityHandler);
      });
      if (timer) clearInterval(timer);
    };
  }, [userRole]);

  return null; // This hook doesn't render anything
}

/**
 * Default export component for easy inclusion
 */
export default function AutoLogout({ userRole }: { userRole?: string }) {
  useAutoLogout(userRole);
  return null;
}
