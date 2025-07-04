'use client';

import Link from 'next/link';

interface InviteData {
  valid: boolean;
  message?: string;
  inviterEmail?: string;
  expiry?: string;
}

interface InviteClientContentProps {
  inviteCode: string;
  inviteData: InviteData;
}

export function InviteClientContent({ inviteCode, inviteData }: InviteClientContentProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Join this Cliq</h2>
          
          {inviteData?.message && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
              <p className="italic text-gray-600">"{inviteData.message}"</p>
              <p className="text-gray-500 text-sm mt-2">From: {inviteData.inviterEmail}</p>
            </div>
          )}

          <p className="text-gray-600 mb-6">
            This invite code gives you access to join a private cliq.
          </p>

          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <p className="font-medium text-center">Already have an account?</p>
              <Link
                href={`/sign-in?inviteCode=${inviteCode}`}
                className="bg-black text-white hover:bg-gray-800 font-semibold px-6 py-2 rounded-lg text-sm"
              >
                Sign In
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-sm text-gray-500">OR</span>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <p className="font-medium text-center">New to Cliqstr?</p>
              <Link
                href={`/sign-up?inviteCode=${inviteCode}`}
                className="border border-black text-black hover:bg-gray-100 font-semibold px-6 py-2 rounded-lg text-sm"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
