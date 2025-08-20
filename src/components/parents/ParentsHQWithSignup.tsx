'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ParentsHQContent from './ParentsHQContent';
import ChildCreateModal from './wizard/ChildCreateModal';

interface ParentsHQWithSignupProps {
  needsSignup: boolean;
  needsChildCreation: boolean;
  needsPermissions: boolean;
  needsUpgradeToParent: boolean;
  prefillEmail: string;
  inviteId?: string;
  inviteCode?: string;
  targetState?: string;
  friendFirstName?: string;
  friendLastName?: string;
}

export default function ParentsHQWithSignup({ 
  needsSignup, 
  needsChildCreation,
  needsPermissions,
  needsUpgradeToParent,
  prefillEmail,
  inviteId,
  inviteCode,
  targetState,
  friendFirstName,
  friendLastName
}: ParentsHQWithSignupProps) {
  
  // Debug logging for email prefill issue
  console.log('[CLIENT DEBUG] ParentsHQWithSignup props:', {
    prefillEmail,
    inviteId,
    targetState,
    needsSignup
  });
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Determine dynamic steps present in this session
  const stepsOrder = [
    needsSignup ? 'PARENT_SIGNUP' : null,
    needsUpgradeToParent ? 'UPGRADE_PARENT' : null,
    needsChildCreation ? 'CHILD_CREATE' : null,
    needsPermissions ? 'PERMISSIONS' : null,
  ].filter(Boolean) as string[];
  const totalSteps = stepsOrder.length;
  const stepIndex = (key: string) => stepsOrder.indexOf(key) + 1; // 1-based

  // Handle parent signup form submission
  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      firstName: (fd.get('firstName') as string)?.trim(),
      lastName: (fd.get('lastName') as string)?.trim(),
      email: ((fd.get('email') as string) || '').trim().toLowerCase(),
      birthdate: (fd.get('birthdate') as string) || '',
      password: (fd.get('password') as string) || '',
      plan: (fd.get('plan') as string) || 'invited-free',
    };

    console.log('[CLIENT] Starting parent signup with payload:', { ...payload, password: '***' });

    try {
      console.log('[CLIENT] Making fetch request to /api/wizard/parent-signup');
      const res = await fetch('/api/wizard/parent-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      console.log('[CLIENT] Fetch response received:', { status: res.status, ok: res.ok });

      const data = await res.json().catch(() => ({}));
      console.log('[CLIENT] API response data:', data);
      if (!res.ok || !data?.ok) {
        const errorMsg = data?.error || data?.message || data?.code || `HTTP ${res.status}: Unable to sign up. Please try again.`;
        console.error('[CLIENT] Signup failed:', errorMsg);
        setErr(errorMsg);
        setSubmitting(false);
        return;
      }

      // Success - force reload to show next step with new session
      // Using window.location instead of router.refresh() to ensure session is picked up
      window.location.href = '/parents/hq#create-child';
    } catch (e) {
      setErr('Network error. Please check your connection and try again.');
      setSubmitting(false);
    }
  }

  // Handle upgrade to parent form submission
  async function handleUpgradeToParent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/wizard/upgrade-to-parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setErr(data?.message || data?.code || 'Unable to upgrade account. Please try again.');
        setSubmitting(false);
        return;
      }

      // Success - force reload to show next step  
      window.location.href = '/parents/hq#create-child';
    } catch (e) {
      setErr('Network error. Please check your connection and try again.');
      setSubmitting(false);
    }
  }

  // Handle permissions form submission
  async function handlePermissions(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      permissions: {
        allowMessaging: fd.get('allowMessaging') === 'on',
        allowPhotoSharing: fd.get('allowPhotoSharing') === 'on',
        allowLocationSharing: fd.get('allowLocationSharing') === 'on',
      }
    };

    try {
      const res = await fetch('/api/wizard/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setErr(data?.message || data?.code || 'Unable to save permissions. Please try again.');
        setSubmitting(false);
        return;
      }

      // Success - redirect to dashboard
      window.location.href = '/parents/hq';
    } catch (e) {
      setErr('Network error. Please check your connection and try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Parent Signup Section - shown at top when needed */}
      {needsSignup && (
        <div className="bg-white border-b border-gray-200 py-8">
          <div className="max-w-md mx-auto px-6">
            <div className="text-center text-sm text-gray-500 mb-1">Step {stepIndex('PARENT_SIGNUP')} of {totalSteps}</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">Create your Parent account</h2>
            <p className="text-center text-gray-600 mb-6">Next you will create your child's account and set permissions.</p>
            
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input 
                  name="firstName" 
                  placeholder="First name" 
                  required 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
                <input 
                  name="lastName" 
                  placeholder="Last name" 
                  required 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
              
              <input
                name="email"
                type="email"
                placeholder="Email"
                defaultValue={prefillEmail}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoComplete="username"
              />
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Birthdate</label>
                <input
                  name="birthdate"
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  max={new Date().toISOString().slice(0,10)}
                />
              </div>
              
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoComplete="new-password"
                minLength={8}
              />

              {/* Plan Selection */}
              <div>
                <label className="block text-sm text-gray-600 mb-3">Choose your plan</label>
                <div className="grid grid-cols-1 gap-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input type="radio" name="plan" value="invited-free" defaultChecked className="mr-3" />
                    <div>
                      <div className="font-medium">Invited-Free</div>
                      <div className="text-sm text-gray-600">Access to invited cliq only</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input type="radio" name="plan" value="basic" className="mr-3" />
                    <div>
                      <div className="font-medium">Basic</div>
                      <div className="text-sm text-gray-600">Create and join multiple cliqs</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input type="radio" name="plan" value="family" className="mr-3" />
                    <div>
                      <div className="font-medium">Family</div>
                      <div className="text-sm text-gray-600">Full family management features</div>
                    </div>
                  </label>
                </div>
              </div>

              {err && <p className="text-sm text-red-600">{err}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upgrade to Parent Section - shown when needed */}
      {needsUpgradeToParent && (
        <div className="bg-white border-b border-gray-200 py-8">
          <div className="max-w-md mx-auto px-6">
            <div className="text-center text-sm text-gray-500 mb-1">Step {stepIndex('UPGRADE_PARENT')} of {totalSteps}</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">Upgrade to Parent Account</h2>
            <p className="text-center text-gray-600 mb-6">Next you will create your child's account and set permissions.</p>
            
            <div className="mb-6 p-4 bg-black rounded-lg border border-black">
              <p className="text-sm text-white">
                You're about to become a Parent on Cliqstr and manage a child account. 
                This will give you access to parental controls and monitoring features.
              </p>
            </div>

            <form onSubmit={handleUpgradeToParent} className="space-y-4">
              <label className="flex items-center space-x-3">
                <input type="checkbox" required className="rounded" />
                <span className="text-sm text-gray-700">
                  I confirm that I accept parental responsibilities and understand 
                  that I will be responsible for monitoring my child's activity on Cliqstr.
                </span>
              </label>

              {err && <p className="text-sm text-red-600">{err}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Upgrading account…' : 'Become a Parent'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Child Creation Section - shown when needed */}
      {needsChildCreation && (
        <ChildCreateModal 
          inviteId={inviteId}
          inviteCode={inviteCode}
          prefillFirstName={friendFirstName}
          prefillLastName={friendLastName}
          stepIndex={stepIndex('CHILD_CREATE')}
          totalSteps={totalSteps}
        />
      )}

      {/* Permissions Section - shown when needed */}
      {needsPermissions && (
        <div className="bg-white border-b border-gray-200 py-8">
          <div className="max-w-md mx-auto px-6">
            <div className="text-center text-sm text-gray-500 mb-1">Step {stepIndex('PERMISSIONS')} of {totalSteps}</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">Set Child Permissions</h2>
            <p className="text-center text-gray-600 mb-6">Final step: choose what your child can do on Cliqstr.</p>
            
            <form onSubmit={handlePermissions} className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" name="allowMessaging" className="rounded" />
                  <span className="text-gray-700">Allow messaging with friends</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input type="checkbox" name="allowPhotoSharing" className="rounded" />
                  <span className="text-gray-700">Allow photo sharing</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input type="checkbox" name="allowLocationSharing" className="rounded" />
                  <span className="text-gray-700">Allow location sharing</span>
                </label>
              </div>

              {err && <p className="text-sm text-red-600">{err}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Saving permissions…' : 'Save permissions'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Your Beautiful Parents HQ Content - only show when no other flows are active */}
      {!needsSignup && !needsChildCreation && !needsPermissions && !needsUpgradeToParent && (
        <ParentsHQContent />
      )}
    </div>
  );
}
