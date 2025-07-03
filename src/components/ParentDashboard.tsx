/**
 * 🔐 APA-HARDENED COMPONENT: ParentDashboard
 *
 * Purpose:
 *   - Provides a parent-friendly interface to manage settings for multiple children
 *   - Fetches all linked children via /api/parent/children
 *   - Displays a dropdown menu to select a child
 *   - Renders the <ParentsHQPage> for the selected child
 *
 * Used In:
 *   - /parents-hq/page.tsx or anywhere a parent needs child management tools
 *
 * Requirements:
 *   - Logged-in user must be a verified parent
 *   - Each child must have a profile and be linked via ParentLink
 *
 * Related Routes:
 *   - GET /api/parent/children → fetches all children linked to this parent
 *   - POST /api/parent/settings/update → updates individual child settings
 */

'use client';

import { useEffect, useState } from 'react';
import { fetchJson } from '@/lib/fetchJson';
import ParentsHQPage from '@/components/ParentsHQPage'; 

// 🧠 Local definition of child structure
interface Child {
  id: string;
  name?: string;
  email?: string;
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  useEffect(() => {
    const fetchChildren = async () => {
      const res = await fetchJson('/api/parent/children');
      setChildren(res);
      if (res.length) setSelectedChildId(res[0].id);
    };
    fetchChildren();
  }, []);

  return (
    <>
      <select
        value={selectedChildId ?? ''}
        onChange={(e) => setSelectedChildId(e.target.value)}
        className="mb-4 border p-2"
      >
        {children.map((child) => (
          <option key={child.id} value={child.id}>
            {child.name || child.email}
          </option>
        ))}
      </select>

      {selectedChildId && <ParentsHQPage childId={selectedChildId} />}
    </>
  );
}
