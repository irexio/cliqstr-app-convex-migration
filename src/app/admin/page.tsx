'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserManagement from '@/components/admin/UserManagement';
import PendingApprovals from '@/components/admin/PendingApprovals';
import CliqManagement from '@/components/admin/CliqManagement';
import StorageSummary from '@/components/admin/StorageSummary';

interface AuthStatus {
  isAuthenticated: boolean;
  user?: {
    id: string;
    email: string;
    profile?: {
      id: string;
      role: string;
      username: string;
      plan?: string | null;
      isApproved: boolean;
    };
  };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  const router = useRouter();
  
  // Check if user is authenticated and has admin role
  useEffect(() => {
    async function checkAuth() {
      try {
        // Try the primary endpoint with fallback
        let res = await fetch('/auth/status');
        if (!res.ok) {
          res = await fetch('/api/auth/status');
        }
        
        if (!res.ok) {
          throw new Error('Failed to fetch auth status');
        }
        
        const data = await res.json();
        setAuthStatus(data);
        
        // If not authenticated, don't redirect - show login form instead
        if (!data.isAuthenticated) {
          setLoading(false);
          return;
        }

        // If authenticated but not admin, redirect to not authorized
        if (data.user?.profile?.role !== 'Admin') {
          router.push('/not-authorized');
          return;
        }
        
        // User is authenticated and is admin
        setLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);
  
  // Handle admin login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Refresh auth status
      const authCheckRes = await fetch('/auth/status');
      if (authCheckRes.ok) {
        const authData = await authCheckRes.json();
        
        if (authData.user?.profile?.role !== 'Admin') {
          setError('You do not have admin privileges');
          return;
        }
        
        // Success - update auth status and refresh page
        setAuthStatus(authData);
        window.location.reload();
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoginLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading admin dashboard...</h1>
          <div className="animate-pulse h-4 bg-gray-200 rounded w-48 mx-auto"></div>
        </div>
      </div>
    );
  }
  
  // Show login form if not authenticated
  if (!authStatus?.isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Admin Dashboard Login</h1>
            <p className="text-gray-600 mt-2">Please sign in with your admin credentials</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleAdminLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#202020]">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">
          Logged in as {authStatus?.user?.profile?.username || authStatus?.user?.email} (Admin)
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'users'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'approvals'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          Pending Approvals
        </button>
        <button
          onClick={() => setActiveTab('cliqs')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'cliqs'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          Cliq Management
        </button>
        <button
          onClick={() => setActiveTab('storage')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'storage'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          Storage Summary
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'approvals' && <PendingApprovals />}
        {activeTab === 'cliqs' && <CliqManagement />}
        {activeTab === 'storage' && <StorageSummary />}
      </div>
    </main>
  );
}
