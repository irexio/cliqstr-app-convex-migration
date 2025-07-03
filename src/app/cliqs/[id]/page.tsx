/**
 * 🔐 APA-HARDENED PAGE: /cliqs/[id]/page.tsx
 *
 * Purpose:
 *   - Renders a single cliq’s feed view
 *   - Requires user to be authenticated
 *
 * Notes:
 *   - Uses dynamic = 'force-dynamic' to bypass SSG caching
 *   - Uses async `params` to satisfy Next 15+ ghost checker
 */

export const dynamic = 'force-dynamic';

import CliqPageServer from '@/components/server/CliqPageServer';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CliqPageServer cliqId={id} />;
}
