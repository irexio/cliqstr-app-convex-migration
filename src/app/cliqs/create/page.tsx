// 🔐 APA-HARDENED — Create New Cliq Page
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { enforceAPA } from '@/lib/auth/enforceAPA';
import CreateCliqForm from '@/components/cliqs/CreateCliqForm';

export default async function CreateCliqPage() {
  const user = await getCurrentUser();
  enforceAPA(user);

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 font-poppins text-[#202020]">
          Create a New Cliq
        </h1>
        <CreateCliqForm userId={user.id} />
      </div>
    </main>
  );
}
