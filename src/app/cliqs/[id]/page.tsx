// 🔐 APA-HARDENED — Cliq Page UI
import CliqPageServer from '@/components/server/CliqPageServer';

export default async function CliqPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  return <CliqPageServer cliqId={id} />;
}
