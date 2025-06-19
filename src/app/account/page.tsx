'use client';

import { useState } from 'react';

const mockAccount = {
  email: 'mimi@example.com',
  role: 'Cliq Master',
  birthdate: 'July 7, 1985',
  parentEmail: '',
  isApproved: true,
  plan: 'Free Trial – 23 days left',
};

export default function AccountPage() {
  const [account, setAccount] = useState(mockAccount);
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(account.email);
  const [parentEmailInput, setParentEmailInput] = useState(account.parentEmail);

  const handleEmailSave = () => {
    setAccount({ ...account, email: emailInput });
    setEditingEmail(false);
  };

  const handleParentEmailSave = () => {
    setAccount({ ...account, parentEmail: parentEmailInput });
    // Add mock "resend email" action here later
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-16 space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-indigo-700">Account Settings</h1>
        <p className="text-gray-600 text-sm">Manage your account details and safety settings.</p>
      </header>

      <section className="space-y-6 bg-white p-6 rounded-xl shadow-sm border">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          {editingEmail ? (
            <div className="mt-2 flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <button
                onClick={handleEmailSave}
                className="text-sm px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingEmail(false);
                  setEmailInput(account.email);
                }}
                className="text-sm px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="mt-1 flex items-center justify-between">
              <p className="text-sm text-gray-800">{account.email}</p>
              <button
                onClick={() => setEditingEmail(true)}
                className="text-sm text-indigo-600 hover:underline"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <p className="mt-1 text-sm text-gray-800">{account.role}</p>
        </div>

        {/* Birthdate */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Birthdate</label>
          <p className="mt-1 text-sm text-gray-800">{account.birthdate}</p>
        </div>

        {/* Parent Email (only if underage or linked) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Parent Email</label>
          <div className="mt-2 flex gap-2">
            <input
              type="email"
              value={parentEmailInput}
              onChange={(e) => setParentEmailInput(e.target.value)}
              placeholder="parent@example.com"
              className="flex-1 border rounded px-3 py-2 text-sm"
            />
            <button
              onClick={handleParentEmailSave}
              className="text-sm px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </div>

        {/* Approval Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Parent Approval</label>
          <p className={`mt-1 text-sm font-semibold ${account.isApproved ? 'text-green-600' : 'text-yellow-600'}`}>
            {account.isApproved ? 'Approved' : 'Pending'}
          </p>
        </div>

        {/* Plan Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Plan</label>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-sm text-gray-800">{account.plan}</p>
            <button className="text-sm text-indigo-600 hover:underline">Manage Plan</button>
          </div>
        </div>
      </section>
    </main>
  );
}
