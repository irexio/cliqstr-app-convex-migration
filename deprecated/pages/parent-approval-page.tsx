import { redirect } from 'next/navigation';

const USE_LEGACY = process.env.USE_LEGACY_PARENTS_HQ === 'true';

// NOTE: target for this stub
// - parent-approval/page.tsx → target = '/parents/hq'

export default async function Page({ searchParams }: { searchParams?: { code?: string } }) {
  console.warn('[DEPRECATED_PAGE_HIT]', { file: __filename, searchParams });

  // Optional legacy render if present and kill switch is on
  if (USE_LEGACY) {
    try {
      const Legacy = (await import('@/legacy/parents-hq-invites/LegacyFallback')).default;
      return <Legacy />;
    } catch {
      // Fall through to canonical redirect
    }
  }

  // Canonical redirect
  const base = '/parents/hq';
  redirect(base);
}

// This file is a deprecation stub. See docs/DEPRECATION — ParentsHQ & Invites.md
