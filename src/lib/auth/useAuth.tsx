"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

interface User {
  id: Id<"users">;
  email: string;
  plan: string | null;
  role: string | null;
  approved: boolean | null;
  myProfile: {
    id: Id<"myProfiles">;
    username: string;
    firstName: string | undefined;
    lastName: string | undefined;
    image: string | undefined;
    bannerImage: string | undefined;
    about: string | undefined;
    birthdate: number | undefined; // Can be undefined since it comes from account
    showYear: boolean;
  } | null;
  account: {
    role: string;
    isApproved: boolean;
    stripeStatus: string | null;
    plan: string | null;
    stripeCustomerId: string | null;
    suspended: boolean;
    birthdate: number;
  } | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get session from server-side with retry logic
  useEffect(() => {
    async function getSession(retryCount = 0) {
      try {
        console.log(`[useAuth] Session check attempt ${retryCount + 1}`);
        const response = await fetch('/api/auth/status', {
          cache: 'no-store',
          credentials: 'include'
        });
        
        console.log(`[useAuth] Response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[useAuth] Session response:', { 
            user: data.user ? 'found' : 'null', 
            userId: data.user?.id,
            userEmail: data.user?.email,
            retryCount,
            hasAccount: !!data.user?.account,
            hasProfile: !!data.user?.myProfile
          });
          if (data.user?.id) {
            setSessionUserId(data.user.id);
            setIsLoading(false);
            return;
          }
        } else {
          console.log('[useAuth] Session check failed:', response.status, response.statusText);
        }
        
        // If no user found and we haven't retried too many times, retry after a short delay
        if (retryCount < 8) { // Increased retry count
          const delay = retryCount < 3 ? 300 : (retryCount < 6 ? 500 : 1000); // Shorter initial delays
          console.log(`[useAuth] Retrying session check in ${delay}ms... (attempt ${retryCount + 1}/8)`);
          setTimeout(() => getSession(retryCount + 1), delay);
          return;
        }
      } catch (error) {
        console.error('[useAuth] Failed to get session:', error);
      }
      
      console.log('[useAuth] Session check exhausted, setting loading to false');
      setIsLoading(false);
    }

    // Add initial delay for first attempt to allow session to establish
    setTimeout(() => getSession(), 100);
  }, []);

  // Get user data from Convex
  const user = useQuery(
    api.users.getCurrentUser,
    sessionUserId ? { userId: sessionUserId as Id<"users"> } : "skip"
  );

  // Debug logging
  console.log('[useAuth] Convex query state:', {
    sessionUserId,
    user: user ? 'found' : 'null',
    userEmail: user?.email,
    isLoading,
    queryLoading: user === undefined
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading: isLoading || (!!sessionUserId && user === undefined),
        error: null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
