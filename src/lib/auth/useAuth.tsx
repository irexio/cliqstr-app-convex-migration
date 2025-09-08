"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

interface User {
  id: string;
  email: string;
  plan: string | null;
  role: string | null;
  approved: boolean | null;
  myProfile: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    bannerImage: string | null;
    about: string | null;
    birthdate: number;
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

  // Get session from server-side
  useEffect(() => {
    async function getSession() {
      try {
        const response = await fetch('/api/auth/status');
        if (response.ok) {
          const data = await response.json();
          if (data.user?.id) {
            setSessionUserId(data.user.id);
          }
        }
      } catch (error) {
        console.error('Failed to get session:', error);
      } finally {
        setIsLoading(false);
      }
    }

    getSession();
  }, []);

  // Get user data from Convex
  const user = useQuery(
    api.users.getCurrentUser,
    sessionUserId ? { userId: sessionUserId as Id<"users"> } : "skip"
  );

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading: isLoading || user === undefined,
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
