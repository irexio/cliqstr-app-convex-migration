export const dynamic = 'force-dynamic';

/**
 * 🔐 APA-HARDENED ROUTE: /parents-hq
 *
 * Purpose:
 *   - Entry point for parents to manage their children's permissions
 *   - Renders <ParentDashboard> with complete permission management
 *   - Includes all permission toggles, Red Alert acceptance, and save functionality
 *
 * Related:
 *   - ParentDashboard.tsx → complete parent dashboard with all child management
 *   - /api/parent/children → fetches child list
 *   - /api/parent/child-profile → fetches child profile and settings
 *   - /api/parent/settings/update → saves all permission changes
 */

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { notFound } from 'next/navigation';
import ParentDashboard from '@/components/parents/ParentDashboard';

export default async function ParentsHQPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'Parent') {
    notFound();
  }
  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Parents HQ</h1>
      <ParentDashboard />
    </main>
  );
}
