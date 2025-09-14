/**
 * 📂 MyCliqs Dashboard — /my-cliqs-dashboard
 *
 * 🔐 APA-Hardened: Accessible only to logged-in users (child or adult)
 * 🔄 CONVEX-OPTIMIZED: Now uses Convex for real-time updates
 *
 * What this page does:
 * - Displays all cliqs the current user owns or is a member of
 * - Uses Convex queries for real-time updates
 * - Renders a responsive grid of cards (1 mobile • 2 tablet • 3 desktop)
 * - Each card includes:
 *   - Banner image (if uploaded) or fallback gradient
 *   - Cliq name, privacy level, description
 *   - Action buttons: View Cliq • View Members • Invite Someone
 *
 * This page serves as the user's central dashboard and launchpad.
 * It is the starting point for nearly all major actions after login.
 *
 * Used in flows:
 * - Direct sign-up (adult or child)
 * - Post-import
 */

'use client';

import { useAuth } from '@/lib/auth/useAuth';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import Link from 'next/link';
import CliqsGrid from '@/components/cliqs/CliqsGrid';
import { DashboardProfileNudge } from '@/components/ui/ProfileNudge';

export default function MyCliqsDashboardPage() {
  const { user, isLoading } = useAuth();
  
  // Get user's cliqs using Convex
  const cliqs = useQuery(api.cliqs.getUserCliqs, 
    user?.id ? { userId: user.id as Id<"users"> } : "skip"
  );

  // Debug logging
  console.log('MyCliqsDashboard Debug:', {
    user: user ? {
      id: user.id,
      email: user.email,
      role: user.role,
      hasAccount: !!user.account,
      hasProfile: !!user.myProfile
    } : null,
    cliqs: cliqs,
    isLoading
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized</h1>
          <p className="text-gray-600">Please sign in to access your dashboard.</p>
        </div>
      </div>
    );
  }
  
  // Check if account exists first
  if (!user.account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Account Setup Incomplete</h1>
          <p className="text-gray-600 mb-4">You need to choose a plan to continue.</p>
          <Link href="/choose-plan" className="text-blue-600 underline">
            Choose a plan
          </Link>
        </div>
      </div>
    );
  }
  
  // Be extremely permissive with plan validation to avoid redirect loops
  // Only redirect if plan is explicitly null or undefined
  // Accept ANY string value including empty string as valid
  if (user.account.plan === null || user.account.plan === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">No Plan Selected</h1>
          <p className="text-gray-600 mb-4">You need to choose a plan to continue.</p>
          <Link href="/choose-plan" className="text-blue-600 underline">
            Choose a plan
          </Link>
        </div>
      </div>
    );
  }

  // Transform Convex data to match expected format
  const formattedCliqs = cliqs ? cliqs.filter(cliq => cliq !== null).map(cliq => ({
    id: cliq._id,
    name: cliq.name,
    description: cliq.description || '',
    privacy: cliq.privacy,
    createdAt: new Date(cliq.createdAt).toISOString(),
    ownerId: cliq.ownerId,
    coverImage: cliq.coverImage,
  })) : [];

  // Determine user state
  // Check if user has created their MyProfile (social media profile)
  const hasProfile = user.myProfile !== null && user.myProfile !== undefined;
  const hasCliqs = formattedCliqs.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header - Always show with both buttons available */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {!hasProfile ? 'Welcome to Cliqstr' : 'My Cliqs'}
            </h1>
            <p className="text-gray-600 mt-2">
              {!hasProfile 
                ? 'Create your profile and start connecting with family and friends.'
                : 'Manage your cliqs and invite friends to join.'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Profile Button - Create or Edit based on profile existence */}
            <Link 
              href={hasProfile ? '/profile/edit' : '/profile/create'}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {hasProfile ? 'Edit Profile' : 'Create Profile'}
            </Link>
            
            {/* Create Cliq Button - Always available */}
            <Link 
              href="/cliqs/build"
              className="flex items-center gap-2 bg-black hover:text-[#c032d1] text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              Create New Cliq
            </Link>
          </div>
        </div>

      {/* Cliq Cards - Priority content at top */}
      {!hasCliqs ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="m22 21-3-3m0 0a5 5 0 1 0-7-7 5 5 0 0 0 7 7z"></path>
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {!hasProfile ? 'Welcome to Cliqstr!' : 'No Cliqs Yet'}
          </h3>
          
          <p className="text-gray-600 mb-8 max-w-md text-center">
            {!hasProfile 
              ? 'Get started by creating your profile or jump right into creating your first cliq. You can always complete your profile later!'
              : 'Create your first cliq to start sharing with family and friends in a private, safe space.'
            }
          </p>
          
          <div className="text-sm text-gray-500 text-center">
            <p>Use the buttons above to get started</p>
            <p className="mt-1">👆 {hasProfile ? 'Create New Cliq' : 'Create Profile or Create New Cliq'}</p>
          </div>
        </div>
      ) : (
        <CliqsGrid initialCliqs={formattedCliqs} currentUserId={user.id} />
      )}

      {/* Profile Nudge - Below cliq cards for better UX flow */}
      {hasCliqs && <DashboardProfileNudge profile={user.myProfile} />}
      </div>
    </div>
  );
}