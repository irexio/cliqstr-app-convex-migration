// 🔐 APA-HARDENED — Cliq Invite Page
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import InviteClient from '@/components/InviteClient';

// Fixed with Joseph-GHOSTS pattern for Next.js 15+
export default async function InvitePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  if (!id) {
    notFound();
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Invite Someone to Your Cliq</h1>
      <InviteClient cliqId={id} inviterId="" />
    </div>
  );
}
