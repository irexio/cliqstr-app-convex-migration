// src/app/cliqs/[id]/invite-request/page.tsx

import InviteRequestForm from '@/components/InviteRequestForm';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

const Page = async ({ params }: any) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <main className="max-w-2xl mx-auto p-10">
      <InviteRequestForm cliqId={params.id} inviterId={user.id} />
    </main>
  );
};

export default Page;
