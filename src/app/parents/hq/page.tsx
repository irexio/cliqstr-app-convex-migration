export const dynamic = 'force-dynamic';

import ParentsHQContent from '@/components/parents/ParentsHQContent';

export default async function Page({ searchParams }: { searchParams: { inviteCode?: string } }) {
  return <ParentsHQContent />;
}
