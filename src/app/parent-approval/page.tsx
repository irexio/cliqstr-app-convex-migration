'use client';

// 🔐 APA-HARDENED by Aiden — Page shell for child user approval.
// This renders the full parent message and imports the form component.

import ParentApprovalForm from './parent-approval-form';

export default function ParentApprovalPage() {
  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center">
      <h1 className="text-2xl font-bold mb-4">We need your parent’s OK 👋</h1>
      <p className="text-sm text-gray-600 mb-6">
        Since you're under 18, we need to verify that a parent or guardian approves your account.
        Please enter their email below — we'll send them a message right away.
      </p>

      <ParentApprovalForm />
    </div>
  );
}
