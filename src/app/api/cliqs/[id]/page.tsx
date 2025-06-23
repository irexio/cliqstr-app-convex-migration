import CliqPageServer from '@/components/server/CliqPageServer';

export default async function Page({ params }: { params: { id: string } }) {
  return await CliqPageServer({ cliqId: params.id });
}
