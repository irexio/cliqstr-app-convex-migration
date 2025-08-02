/**
 * 🔐 APA-HARDENED — Invite Declined Confirmation Page
 * 
 * Shows confirmation when a parent declines a child's cliq invite
 * Handles different states: success, already declined, errors
 */

'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function DeclinedPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const status = searchParams.get('status');

  // Handle different states
  if (error === 'invalid') {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <h1 className="text-2xl font-semibold mb-4 text-red-600">Invalid Link</h1>
        <p className="text-gray-600">
          This decline link is not valid. Please check the link in your email.
        </p>
        <p className="mt-6 text-sm text-gray-400">
          Want to learn more about Cliqstr? <Link href="/" className="underline text-blue-600">Visit our homepage</Link>
        </p>
      </div>
    );
  }

  if (error === 'notfound') {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <h1 className="text-2xl font-semibold mb-4 text-red-600">Invitation Not Found</h1>
        <p className="text-gray-600">
          This invitation could not be found. It may have expired or been removed.
        </p>
        <p className="mt-6 text-sm text-gray-400">
          Want to learn more about Cliqstr? <Link href="/" className="underline text-blue-600">Visit our homepage</Link>
        </p>
      </div>
    );
  }

  if (error === 'used') {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <h1 className="text-2xl font-semibold mb-4 text-orange-600">Invitation Already Accepted</h1>
        <p className="text-gray-600">
          This invitation has already been accepted and cannot be declined.
        </p>
        <p className="mt-6 text-sm text-gray-400">
          Want to learn more about Cliqstr? <Link href="/" className="underline text-blue-600">Visit our homepage</Link>
        </p>
      </div>
    );
  }

  if (status === 'already') {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <h1 className="text-2xl font-semibold mb-4">Already Declined</h1>
        <p className="text-gray-600">
          You've already declined this invitation. No further action is required.
        </p>
        <p className="mt-6 text-sm text-gray-400">
          Want to learn more about Cliqstr? <Link href="/" className="underline text-blue-600">Visit our homepage</Link>
        </p>
      </div>
    );
  }

  if (error === 'server') {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <h1 className="text-2xl font-semibold mb-4 text-red-600">Something Went Wrong</h1>
        <p className="text-gray-600">
          There was an error processing your request. Please try again or contact support.
        </p>
        <p className="mt-6 text-sm text-gray-400">
          Want to learn more about Cliqstr? <Link href="/" className="underline text-blue-600">Visit our homepage</Link>
        </p>
      </div>
    );
  }

  // Success state (default)
  return (
    <div className="max-w-xl mx-auto text-center py-20">
      <div className="mb-6">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </div>
      </div>
      
      <h1 className="text-2xl font-semibold mb-4">Invitation Declined</h1>
      <p className="text-gray-600 mb-2">
        You've declined the invitation to join Cliqstr.
      </p>
      <p className="text-gray-600">
        No further action is required.
      </p>
      
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-400 mb-2">
          Want to learn more about Cliqstr?
        </p>
        <Link href="/" className="text-blue-600 underline text-sm hover:text-blue-700">
          Visit our homepage
        </Link>
      </div>
    </div>
  );
}
