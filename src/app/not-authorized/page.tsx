'use client';

import { useRouter } from 'next/navigation';

export default function NotAuthorized() {
  const router = useRouter();
  
  return (
    <main className="max-w-3xl mx-auto p-6 md:p-10 text-center">
      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Not Authorized</h1>
        <div className="text-lg mb-6 text-red-600">
          You don&apos;t have permission to access this area.
        </div>
        <p className="mb-6 text-gray-600">
          This area requires administrator privileges. If you believe you should have access, please contact your system administrator.
        </p>
        <button
          onClick={() => router.push('/my-cliqs')}
          className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    </main>
  );
}
