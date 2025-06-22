// src/app/sign-up/SignUpClient.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SignUpClient() {
  const searchParams = useSearchParams();
  const [referral, setReferral] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get('ref');
    setReferral(ref);
  }, [searchParams]);

  return (
    <div className="p-8 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-[#202020] mb-6 font-poppins">Create Your Cliqstr Account</h1>
      {referral ? (
        <p className="text-green-700">
          Referred by: <strong>{referral}</strong>
        </p>
      ) : (
        <p className="text-gray-600">No referral code found.</p>
      )}
    </div>
  );
}
