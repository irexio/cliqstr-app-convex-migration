import Link from 'next/link';

export default function JoinInvalidPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Join Code</h1>
      <p className="text-gray-700 max-w-md mb-4">
        The join code you entered is not valid. It may have expired, been used already, or been entered incorrectly.
      </p>
      <p className="text-gray-600 mb-6">
        Please check the code and try again, or ask for a new invite.
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
