// 🔐 APA SUSPENDED PAGE — shown to users whose accounts are suspended
import Link from 'next/link';

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 px-4">
      <div className="bg-white border border-red-200 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-700 mb-4">Account Suspended</h1>
        <p className="text-red-800 mb-4 font-medium">
          Your account has been suspended by a parent or administrator.<br />
          You cannot access Cliqstr until your account is reinstated.
        </p>
        <p className="text-gray-600 mb-6">
          If you believe this was a mistake, please contact your parent or reach out to support.
        </p>
        <Link href="/sign-out" className="inline-block bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 font-semibold transition">
          Sign Out
        </Link>
      </div>
    </div>
  );
}
