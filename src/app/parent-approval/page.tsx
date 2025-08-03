// 🔐 APA-HARDENED — Parent Approval Landing Page
'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function ParentApprovalPage() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('inviteCode') ?? '';

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-2xl font-bold text-black uppercase tracking-wide">
          Parent/Guardian Approval
        </h1>

        <div className="space-y-4">
          <Button 
            className="w-full h-14 text-lg bg-black text-white hover:bg-gray-900" 
            asChild
          >
            <a href={`/parents/hq?inviteCode=${inviteCode}`}>
              Continue to Approve Child Invite
            </a>
          </Button>

          <Button 
            variant="outline" 
            className="w-full h-14 text-gray-700 text-sm" 
            asChild
          >
            <a href="/">Decline This Invitation</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
