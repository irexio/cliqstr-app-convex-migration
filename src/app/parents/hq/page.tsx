export const dynamic = 'force-dynamic';

import ParentsHQWizard from '@/components/parents/ParentsHQWizard';
import ParentsHQContent from '@/components/parents/ParentsHQContent';

export default async function Page({ searchParams }: { searchParams: { inviteCode?: string } }) {
  // Always use the new wizard - it handles both invite codes and regular parent setup
  return <ParentsHQWizard />;
}
