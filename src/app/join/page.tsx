/**
 * Join Page
 * 
 * Purpose:
 * - Landing page when users enter an invite code
 * - Allows existing users to sign in and new users to sign up with pre-filled invite code
 * - Automatically used for "Join a Cliq" flow
 * - Server component that gets invite code from params and passes to client component
 */

// Server Component - no 'use client' directive here
import { Suspense } from 'react';
import Link from 'next/link';
import { InviteClientContent } from '../../components/InviteClientContent';
import type { Metadata } from 'next';

// Define the correct param type for Next.js 15 to fix "ghost type" error
type Props = {
  params: Promise<{ [key: string]: string | string}>;
  searchParams: { [key: string]: string | string[] | undefined };
};

// This is a server component that gets the search parameters server-side
export default async function JoinPage({ params, searchParams }: Props) {
  // Wait for params promise to resolve (required by Next.js 15+)
  await params;
  // Extract the code from searchParams passed by Next.js
  const inviteCode = searchParams?.code ? (Array.isArray(searchParams.code) ? searchParams.code[0] : searchParams.code) : '';
  
  // If no code, show error
  if (!inviteCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-md mx-auto space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Invalid Invite</h2>
            <p className="text-gray-600 mb-6">No invite code provided</p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/"
                className="bg-black text-white hover:bg-gray-800 font-semibold px-6 py-2 rounded-lg text-sm"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Server-side validation of invite code
  let inviteData;
  let error = '';
  
  try {
    // Use server-side fetch to validate the invite code
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/invites/validate?code=${inviteCode}`, { 
      cache: 'no-store'
    });
    const data = await response.json();
    
    if (data.valid) {
      inviteData = data;
    } else {
      error = data.message || 'Invalid invite code';
    }
  } catch (err) {
    console.error('Error validating invite code:', err);
    error = 'Error validating invite code';
  }
  
  // If error during validation
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-md mx-auto space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Invalid Invite</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/"
                className="bg-black text-white hover:bg-gray-800 font-semibold px-6 py-2 rounded-lg text-sm"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Pass the data to the client component
  return <InviteClientContent inviteCode={inviteCode} inviteData={inviteData} />
}
