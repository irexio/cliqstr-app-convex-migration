'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function JoinClient() {
  const searchParams = useSearchParams();
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('invite');
    setInviteCode(code);
  }, [searchParams]);

  return (
    <div className="p-8 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins">Welcome to Cliqstr</h1>
      {inviteCode ? (
        <p className="text-green-700">
          You’ve been invited with code: <strong>{inviteCode}</strong>
        </p>
      ) : (
        <p className="text-gray-600">No invite code found.</p>
      )}
    </div>
  );
}
