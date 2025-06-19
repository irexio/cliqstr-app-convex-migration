// src/app/cliqs/[id]/page.tsx

import CliqPageServer from '@/components/server/CliqPageServer';

const Page = async ({ params }: any) => {
  return await CliqPageServer({ cliqId: params.id });
};

export default Page;
