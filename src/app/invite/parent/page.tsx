import { redirect } from 'next/navigation';

const USE_LEGACY = process.env.USE_LEGACY_PARENTS_HQ === 'true';

// NOTE: target for this stub
// - invite/parent/page.tsx → target = '/invite/accept?code='

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

  // Canonical redirect with code preservation
  const code = (searchParams?.code || '').trim();
  const base = '/invite/accept?code=';
  if (base.includes('?code=')) {
    redirect(code ? `${base}${encodeURIComponent(code)}` : '/invite/invalid');
  } else {
    redirect(base);
  }
}

// This file is a deprecation stub. See docs/DEPRECATION — ParentsHQ & Invites.md
