'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchJson } from '@/lib/fetchJson';

// Step Components
import ParentUpgradeStep from './wizard/ParentUpgradeStep';
import ParentAccountCreationStep from './wizard/ParentAccountCreationStep';
import ChildAccountStep from './wizard/ChildAccountStep';
import PermissionSetupStep from './wizard/PermissionSetupStep';
import SuccessStep from './wizard/SuccessStep';
import ParentDashboard from './ParentDashboard';

type WizardStep = 'upgrade' | 'create-account' | 'create-child' | 'permissions' | 'success' | 'dashboard';

interface UserData {
  id: string;
  email: string;
  role: string;
  isParent?: boolean;
}

interface ChildData {
  username: string;
  password: string;
  permissions: {
    canCreatePublicCliqs: boolean;
    canCreatePrivateCliqs: boolean;
    canJoinPublicCliqs: boolean;
    canInviteOthers: boolean;
    canInviteAdults: boolean;
    requiresParentApproval: boolean;
    canUploadVideos: boolean;
    canShareYouTubeVideos: boolean;
    canAccessGames: boolean;
    silentMonitoring: boolean;
  };
}

export default function ParentsHQWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('upgrade');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [inviteDetails, setInviteDetails] = useState<any>(null);
  const [childData, setChildData] = useState<ChildData>({
    username: '',
    password: '',
    permissions: {
      canCreatePublicCliqs: false,
      canCreatePrivateCliqs: true,
      canJoinPublicCliqs: false,
      canInviteOthers: false,
      canInviteAdults: false,
      requiresParentApproval: true,
      canUploadVideos: false,
      canShareYouTubeVideos: false,
      canAccessGames: false,
      silentMonitoring: true,
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check user status and determine starting step
  // Force deployment refresh - fix invite flow
  useEffect(() => {
    async function checkUserStatus() {
      try {
        // Get invite code from URL if present
        const urlInviteCode = searchParams.get('inviteCode');
        if (urlInviteCode) {
          setInviteCode(urlInviteCode);
          
          // Validate invite and get details
          try {
            const inviteRes = await fetch(`/api/invites/validate?code=${encodeURIComponent(urlInviteCode)}`);
            const inviteData = await inviteRes.json();
            if (inviteRes.ok && inviteData.valid) {
              setInviteDetails(inviteData);
            }
          } catch (err) {
            console.error('Error validating invite:', err);
          }
        }

        const res = await fetch('/api/auth/status');
        const data = res.ok ? await res.json() : null;
        
        // If user is not authenticated
        if (!res.ok || !data?.user) {
          // If there's an invite code, show account creation step instead of redirecting to sign-in
          if (urlInviteCode) {
            setUserData(null); // No user data yet
            setCurrentStep('create-account');
            setLoading(false);
            return;
          } else {
            // No invite code, redirect to sign-in
            router.push('/sign-in');
            return;
          }
        }

        // Block children from accessing Parents HQ
        if (data.user.role === 'Child') {
          router.push('/awaiting-approval');
          return;
        }

        setUserData(data.user);

        // Determine starting step based on user role and invite presence
        if (urlInviteCode) {
          // Invite flow - check if user needs account creation
          if (!data.user.id) {
            setCurrentStep('create-account');
          } else if (data.user.role === 'Adult') {
            setCurrentStep('upgrade');
          } else {
            // Already a parent with invite - go to child approval
            setCurrentStep('create-child');
          }
        } else {
          // Regular flow without invite
          if (data.user.role === 'Parent') {
            // Already a parent - check if they have children
            const childrenRes = await fetchJson('/api/parent/children');
            if (childrenRes.length > 0) {
              setCurrentStep('dashboard');
            } else {
              setCurrentStep('create-child');
            }
          } else {
            // Adult user - needs to upgrade to parent
            setCurrentStep('upgrade');
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        setError('Failed to load user information');
      } finally {
        setLoading(false);
      }
    }

    checkUserStatus();
  }, [router, searchParams]);

  const handleUpgradeToParent = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/account/upgrade-to-parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Failed to upgrade to parent account');
      }

      const data = await res.json();
      
      // Update user data
      if (userData) {
        setUserData({ ...userData, role: 'Parent', isParent: true });
      }

      setCurrentStep('create-child');
    } catch (error) {
      console.error('Error upgrading to parent:', error);
      setError('Failed to upgrade account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateParentAccount = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Create parent account via sign-up API
      const signUpRes = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role: 'Adult', // Will be upgraded to Parent in next step
          isVerified: email === inviteDetails?.parentEmail, // Auto-verify if matches invite
        }),
      });

      if (!signUpRes.ok) {
        const signUpData = await signUpRes.json();
        throw new Error(signUpData.error || 'Failed to create account');
      }

      // Sign in the new user
      const signInRes = await fetch('/api/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: email,
          password,
        }),
      });

      if (!signInRes.ok) {
        throw new Error('Account created but sign-in failed. Please try signing in manually.');
      }

      // Update user data and proceed to upgrade step
      const userData = await signInRes.json();
      setUserData(userData.user);
      setCurrentStep('upgrade');
    } catch (error: any) {
      console.error('Error creating parent account:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChild = async () => {
    try {
      setLoading(true);
      const res = await fetchJson('/api/parent/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: childData.username,
          password: childData.password,
          code: inviteCode, // Include invite code for child approval
          permissions: childData.permissions,
          silentMonitoring: childData.permissions.silentMonitoring,
        }),
      });

      if (res.ok) {
        setCurrentStep('success');
      } else {
        throw new Error(res.reason || 'Failed to create child account');
      }
    } catch (error) {
      console.error('Error creating child:', error);
      setError('Failed to create child account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStepNavigation = (step: WizardStep) => {
    setCurrentStep(step);
    setError('');
  };

  if (loading && !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Parents HQ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-4">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 'create-account':
        return (
          <ParentAccountCreationStep
            inviteCode={inviteCode || ''}
            invitedEmail={inviteDetails?.parentEmail}
            childName={inviteDetails?.childName}
            inviterName={inviteDetails?.inviterName}
            onAccountCreated={handleCreateParentAccount}
            loading={loading}
          />
        );

      case 'upgrade':
        return (
          <ParentUpgradeStep
            userData={userData}
            onUpgrade={handleUpgradeToParent}
            loading={loading}
          />
        );
      
      case 'create-child':
        return (
          <ChildAccountStep
            childData={childData}
            setChildData={setChildData}
            onNext={() => setCurrentStep('permissions')}
            onBack={() => inviteCode ? setCurrentStep('create-account') : setCurrentStep('upgrade')}
          />
        );
      
      case 'permissions':
        return (
          <PermissionSetupStep
            childData={childData}
            setChildData={setChildData}
            onCreateChild={handleCreateChild}
            onBack={() => setCurrentStep('create-child')}
            loading={loading}
          />
        );
      
      case 'success':
        return (
          <SuccessStep
            childUsername={childData.username}
            onContinue={() => setCurrentStep('dashboard')}
            onCreateAnother={() => {
              setChildData({
                username: '',
                password: '',
                permissions: childData.permissions // Keep same permission settings
              });
              setCurrentStep('create-child');
            }}
          />
        );
      
      case 'dashboard':
        return <ParentDashboard />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🛡️ Parents HQ</h1>
          <p className="text-gray-600">
            {currentStep === 'dashboard' 
              ? 'Manage your children\'s accounts and safety settings'
              : 'Set up parental controls for safe social media experience'
            }
          </p>
        </div>

        {/* Progress Indicator (only show during wizard steps) */}
        {!['dashboard'].includes(currentStep) && (
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {(inviteCode ? [
                { key: 'create-account', label: 'Create Account', icon: '🛡️' },
                { key: 'create-child', label: 'Child Approval', icon: '👶' },
                { key: 'permissions', label: 'Safety Settings', icon: '🔒' },
                { key: 'success', label: 'Complete', icon: '✅' },
              ] : [
                { key: 'upgrade', label: 'Parent Account', icon: '👤' },
                { key: 'create-child', label: 'Child Account', icon: '👶' },
                { key: 'permissions', label: 'Safety Settings', icon: '🛡️' },
                { key: 'success', label: 'Complete', icon: '✅' },
              ]).map((step, index) => {
                const isActive = currentStep === step.key;
                const stepOrder = inviteCode 
                  ? ['create-account', 'create-child', 'permissions', 'success']
                  : ['upgrade', 'create-child', 'permissions', 'success'];
                const isCompleted = stepOrder.indexOf(currentStep) > stepOrder.indexOf(step.key);
                
                return (
                  <div key={step.key} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                      isCompleted 
                        ? 'bg-green-600 text-white' 
                        : isActive 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted ? '✓' : step.icon}
                    </div>
                    <span className={`ml-2 text-sm ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                      {step.label}
                    </span>
                    {index < 3 && (
                      <div className={`w-8 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
