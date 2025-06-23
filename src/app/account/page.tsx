'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();
  const [accessAllowed, setAccessAllowed] = useState(false);
  
  // SECURITY: Account editing is only accessible from Parents HQ
  // Children should not be able to access this page directly
  useEffect(() => {
    // Check if user came from Parents HQ or has proper authorization
    const referrer = document.referrer;
    const isFromParentsHQ = referrer.includes('/parents-hq');
    
    if (isFromParentsHQ) {
      setAccessAllowed(true);
    } else {
      // Redirect unauthorized access to Parents HQ
      router.push('/parents-hq');
    }
  }, [router]);

  if (!accessAllowed) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Restricted</h1>
          <p className="text-gray-600">
            Account settings can only be accessed through Parents HQ.
          </p>
          <p className="text-gray-500 text-sm mt-2">Redirecting to Parents HQ...</p>
        </div>
      </main>
    );
  }

  // TODO: Replace with real account management interface
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <div className="mb-4">
        <button 
          onClick={() => router.push('/parents-hq')} 
          className="text-sm text-[#6f4eff] hover:underline"
        >
          ← Back to Parents HQ
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Account Settings</h1>
        <p className="text-gray-600 mb-6">
          Manage your child's account settings and information.
        </p>
        
        <div className="space-y-4 text-sm text-gray-500">
          <p>🚧 Account management interface coming soon...</p>
          <p>For now, account changes can be made through the database or Parents HQ controls.</p>
        </div>
      </div>
    </main>
  );
}
