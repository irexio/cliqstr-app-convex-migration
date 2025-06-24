// src/app/cliqs/[id]/page.tsx

import CliqPageServer from '@/components/server/CliqPageServer';

export default async function CliqPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return <CliqPageServer cliqId={params.id} />;
}
