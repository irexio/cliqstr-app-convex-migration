export default function InvalidInvitePage() {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid or Expired Invitation</h1>
        <p className="text-gray-700 max-w-md">
          The invitation link you used is no longer valid. It may have expired, been used already, or been entered incorrectly.
        </p>
        <p className="text-gray-600 mt-4">
          Please ask the person who invited you to send a new invite.
        </p>
      </div>
    );
  }
  