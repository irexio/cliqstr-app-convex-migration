'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface InviteCodeModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function InviteCodeModal({ open, setOpen }: InviteCodeModalProps) {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Close the modal
  const handleClose = () => {
    setOpen(false);
    setInviteCode('');
    setError('');
  };

  // Submit the invite code
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }
    
    setLoading(true);
    
    try {
      // Check if the invite code exists
      const response = await fetch(`/api/invites/validate?code=${inviteCode.trim()}`);
      const data = await response.json();
      
      if (data.valid) {
        // Redirect to the join page with the invite code
        router.push(`/join?code=${inviteCode.trim()}`);
      } else {
        setError(data.message || 'Invalid invite code');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Invite code validation error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-4 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Join a Cliq</h2>
        
        <p className="text-gray-600 mb-6 text-center">
          Enter your invite code to join a private cliq
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
              Invite Code
            </label>
            <input
              type="text"
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#c032d1] focus:border-[#c032d1] focus:outline-none"
              placeholder="Enter your invite code"
              disabled={loading}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white hover:bg-gray-800 font-semibold px-4 py-2 rounded-lg text-sm"
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
