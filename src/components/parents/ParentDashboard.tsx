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


// 🧠 Local definition of child structure
interface Child {
  id: string;
  name?: string;
  email?: string;
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ username: '', password: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchChildren = async () => {
      const res = await fetchJson('/api/parent/children');
      setChildren(res);
      if (res.length) setSelectedChildId(res[0].id);
    };
    fetchChildren();
  }, []);

  const handleCreateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      const newChild = await fetchJson('/api/parent/create-child', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: createForm.username,
          password: createForm.password
        })
      });
      
      // Add new child to list and select it
      setChildren(prev => [...prev, newChild]);
      setSelectedChildId(newChild.id);
      
      // Reset form
      setCreateForm({ username: '', password: '' });
      setShowCreateForm(false);
      
      alert('Child account created successfully!');
    } catch (error) {
      alert('Failed to create child account. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Create Child Account Section */}
      <div className="border rounded p-4 bg-blue-50">
        <h3 className="font-semibold mb-2">Create New Child Account</h3>
        
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Create Child Account
          </button>
        ) : (
          <form onSubmit={handleCreateChild} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Username:</label>
              <input
                type="text"
                value={createForm.username}
                onChange={(e) => setCreateForm(prev => ({ ...prev, username: e.target.value }))}
                className="border rounded px-3 py-2 w-full max-w-xs"
                required
                minLength={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password:</label>
              <input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                className="border rounded px-3 py-2 w-full max-w-xs"
                required
                minLength={6}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Account'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateForm({ username: '', password: '' });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Existing Children Section */}
      {children.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Manage Existing Children</h3>
          <select
            value={selectedChildId ?? ''}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="mb-4 border p-2 rounded"
          >
            <option value="">Select a child...</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name || child.email}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedChildId && (
        <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Child Management</h2>
          <p className="text-gray-600 mb-4">
            Managing settings for child ID: <span className="font-mono">{selectedChildId}</span>
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              🚧 Detailed child permission management interface coming soon.
              This will include all the permission toggles, monitoring settings, and safety controls.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
