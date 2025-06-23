// src/app/cliqs/[id]/page.tsx

import CliqPageServer from '@/components/server/CliqPageServer';

export default async function CliqPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Cliq: {id}</h1>
      <p className="text-gray-600">This cliq page is under development.</p>
    </div>
  );
}
