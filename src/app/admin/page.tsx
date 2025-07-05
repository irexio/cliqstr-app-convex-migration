'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserManagement from '@/components/admin/UserManagement';
import PendingApprovals from '@/components/admin/PendingApprovals';
import CliqManagement from '@/components/admin/CliqManagement';
import StorageSummary from '@/components/admin/StorageSummary';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const router = useRouter();
  
  useEffect(() => {
    async function checkAdminStatus() {
      try {
        // Try primary auth endpoint
        let response = await fetch('/auth/status', {
          credentials: 'include',
          cache: 'no-store',
        });
        
        // If primary fails, try fallback
        if (!response.ok) {
          response = await fetch('/api/auth/status', {
            credentials: 'include',
            cache: 'no-store',
          });
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        const userData = data.user;
        
        // Check for admin role
        if (!userData?.profile?.role || userData.profile.role !== 'Admin') {
          console.log('Not an admin, redirecting');
          router.push('/not-authorized');
          return;
        }
        
        setUser(userData);
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/not-authorized');
      } finally {
        setLoading(false);
      }
    }
    
    checkAdminStatus();
  }, [router]);
  
  if (loading) {
    return (
      <main className="max-w-7xl mx-auto p-6">
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-black border-r-transparent"></div>
          <p className="mt-4">Loading admin dashboard...</p>
        </div>
      </main>
    );
  }
  
  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#202020]">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">
          Logged in as {user?.profile?.username || user?.email} (Admin)
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
