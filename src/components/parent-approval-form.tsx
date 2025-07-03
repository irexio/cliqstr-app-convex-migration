'use client';

// 🔐 APA-HARDENED — Parent approval form component
// This is part of the APA compliance flow for underage users

import { useState, FormEvent } from 'react';

export default function ParentApprovalForm() {
  const [parentEmail, setParentEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    if (!isValid) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    setEmailError(null);
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate email before submission
    if (!validateEmail(parentEmail)) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Send request to your API endpoint for parent verification
      const response = await fetch('/api/parent-approval/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parentEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send parent approval request');
      }

      setSuccess(true);
    } catch (err) {
      console.error('Parent approval request error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 text-4xl mb-4">✅</div>
        <h3 className="text-lg font-medium text-green-800">Request sent!</h3>
        <p className="text-sm text-green-700 mt-2">
          We've emailed your parent/guardian. They'll need to verify your account before you can continue.
        </p>
        <p className="text-xs text-green-600 mt-4">
          Please ask them to check their inbox (and spam folder) for an email from Cliqstr.
        </p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="parentEmail" className="block text-sm font-medium text-left text-gray-700">
            Parent/Guardian Email
          </label>
          <input
            id="parentEmail"
            type="email"
            placeholder="parent@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            disabled={isSubmitting}
          />
          {emailError && (
            <p className="text-red-600 text-xs text-left">{emailError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#c032d1] hover:bg-[#a02bae] text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:bg-purple-300"
        >
          {isSubmitting ? 'Sending...' : 'Send Verification Request'}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-6">
        Your parent/guardian will receive an email with instructions to verify your account.
        They will need to confirm they are over 18 and give permission for you to use Cliqstr.
      </p>
    </>
  );
}
