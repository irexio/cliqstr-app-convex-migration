import Link from 'next/link';

export default function JoinExpiredPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Expired Join Code</h1>
      <p className="text-gray-700 max-w-md mb-4">
        The join code you entered has expired. Join codes are only valid for a limited time.
      </p>
      <p className="text-gray-600 mb-6">
        Please ask for a new invite to join this cliq.
      </p>
      <Link 
        href="/my-cliqs-dashboard" 
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
