'use client';

import { useState, useEffect } from 'react';
import AutoLogout from '@/lib/auth/auto-logout';

interface SessionProviderProps {
  children: React.ReactNode;
}

export default function SessionProvider({ children }: SessionProviderProps) {
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Fetch the user session on component mount
  useEffect(() => {
    async function fetchUserSession() {
      try {
        // Try the primary endpoint with fallback
        let res = await fetch('/auth/status');
        if (!res.ok) {
          res = await fetch('/api/auth/status');
        }
        
        if (res.ok) {
          const data = await res.json();
          if (data.isAuthenticated && data.user?.profile?.role) {
            setUserRole(data.user.profile.role);
          }
        }
      } catch (error) {
        console.error('Error fetching user session:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserSession();
  }, []);

  return (
    <>
      {/* Apply auto-logout for authenticated users */}
      {userRole && <AutoLogout userRole={userRole} />}
      {children}
    </>
  );
}
