/**
 * 🔐 APA-HARDENED ROUTE: /parents-hq
 *
 * Purpose:
 *   - Entry point for parents to manage their children’s permissions
 *   - Renders <ParentDashboard>, which allows switching between children
 *   - Includes toggles, visibility controls, and safe persistence
 *
 * Related:
 *   - ParentDashboard.tsx → child picker
 *   - ParentsHQPage.tsx → per-child toggle manager
 *   - /api/parent/children → fetches child list
 *   - /api/parent/settings/update → saves changes
 */

'use client';

import ParentDashboard from '@/components/ParentDashboard'; // 🔁 update path if needed

export default function ParentsHQPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Parents HQ</h1>
      <ParentDashboard />
    </main>
  );
}
