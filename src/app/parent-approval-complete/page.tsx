'use client';

import Link from 'next/link';

export default function ParentApprovalCompletePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-4">
      <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins">Approval Complete</h1>
      <p className="text-lg text-gray-700 mb-6">
        Thanks for confirming your child’s account. They can now start using Cliqstr!
      </p>
      <Link
        href="/sign-in"
        className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
      >
        Go to Sign In
      </Link>
    </main>
  );
}
