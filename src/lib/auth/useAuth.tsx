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
      // Add initial delay for first attempt to allow session to establish
      if (retryCount === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      try {
        const response = await fetch('/api/auth/status', {
          cache: 'no-store',
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          console.log('[useAuth] Session response:', { 
            user: data.user ? 'found' : 'null', 
            userId: data.user?.id,
            userEmail: data.user?.email,
            retryCount 
          });
          if (data.user?.id) {
            setSessionUserId(data.user.id);
            setIsLoading(false);
            return;
          }
        } else {
          console.log('[useAuth] Session check failed:', response.status);
        }
        
        // If no user found and we haven't retried too many times, retry after a short delay
        if (retryCount < 5) {
          const delay = retryCount < 2 ? 500 : 1000; // Longer delays for later retries
          console.log(`[useAuth] Retrying session check in ${delay}ms... (attempt ${retryCount + 1}/5)`);
          setTimeout(() => getSession(retryCount + 1), delay);
          return;
        }
      } catch (error) {
        console.error('[useAuth] Failed to get session:', error);
      }
      
      setIsLoading(false);
    }

    getSession();
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
