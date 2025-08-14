'use client';

/**
 * 🎨 ELEGANT PARENT INVITE WIZARD - Complete Flow
 * 
 * Purpose:
 *   - Handle complete parent invite flow in one seamless wizard
 *   - Step 1: Parent Account Creation
 *   - Step 2: Plan Selection (future)
 *   - Step 3: Payment Verification (future)
 *   - Step 4: Child Account Setup
 *   - Step 5: Safety Agreement
 *   - Step 6: Success Page
 * 
 * Security:
 *   - Age verification for both parent and child
 *   - APA compliance throughout
 *   - No separate sign-in required
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/Button';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Wizard Steps
type WizardStep = 'parent-signup' | 'plan-selection' | 'child-setup' | 'permissions' | 'success';

interface ChildPermissions {
  canPost: boolean;
  canComment: boolean;
  canInviteFriends: boolean;
  canJoinNewCliqs: boolean;
  canCreateCliqs: boolean;
  canUploadImages: boolean;
  canUploadVideos: boolean;
  canPlayGames: boolean;
}

interface ExistingChild {
  id: string;
  firstName: string;
  username: string;
}

interface ParentFormData {
  firstName: string;
  lastName: string;
  email: string;
  birthdate: string;
  password: string;
  confirmPassword: string;
}

const REGULAR_CHILD_DEFAULTS: ChildPermissions = {
  canPost: true,
  canComment: true,
  canInviteFriends: true,
  canJoinNewCliqs: true,
  canCreateCliqs: true,
  canUploadImages: true,
  canUploadVideos: true,
  canPlayGames: true,
};

const INVITED_CHILD_PERMISSIONS: ChildPermissions = {
  canPost: true,
  canComment: true,
  canInviteFriends: false,    // 🔒 Locked
  canJoinNewCliqs: false,     // 🔒 Locked
  canCreateCliqs: false,      // 🔒 Locked
  canUploadImages: true,
  canUploadVideos: false,     // 🔒 Locked
  canPlayGames: true,
};

export default function StreamlinedParentsHQWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams?.get('inviteCode');
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('parent-signup');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // User and invite data
  const [userData, setUserData] = useState<any>(null);
  const [inviteDetails, setInviteDetails] = useState<any>(null);
  const [existingChildren, setExistingChildren] = useState<ExistingChild[]>([]);
  
  // Parent form data
  const [parentData, setParentData] = useState<ParentFormData>({
    firstName: '',
    lastName: '',
    email: '',
    birthdate: '',
    password: '',
    confirmPassword: ''
  });
  
  // Child form state
  const [selectedChildId, setSelectedChildId] = useState<string>('new');
  const [childFirstName, setChildFirstName] = useState('');
  const [childLastName, setChildLastName] = useState('');
  const [childUsername, setChildUsername] = useState('');
  const [childPassword, setChildPassword] = useState('');
  const [childBirthdate, setChildBirthdate] = useState('');
  const [showChildPassword, setShowChildPassword] = useState(false);
  const [permissions, setPermissions] = useState<ChildPermissions>(REGULAR_CHILD_DEFAULTS);
  
  const isInvitedChild = Boolean(inviteCode && inviteDetails);

  // Initialize wizard
  useEffect(() => {
    async function initialize() {
      try {
        // Check if user is already authenticated
        const authRes = await fetch('/api/auth/status');
        const authData = await authRes.json();
        
        if (authRes.ok && authData?.user) {
          setUserData(authData.user);
          // Even if authenticated, show parent signup to collect any missing info
          setCurrentStep('parent-signup');
        } else {
          // Not authenticated, start with parent signup
          setCurrentStep('parent-signup');
        }

        // Load existing children
        const childrenRes = await fetch('/api/parent/children');
        if (childrenRes.ok) {
          const childrenData = await childrenRes.json();
          setExistingChildren(childrenData.children || []);
        }

        // If there's an invite code, validate it and pre-fill child name
        if (inviteCode) {
          const inviteRes = await fetch(`/api/invites/validate?code=${encodeURIComponent(inviteCode)}`);
          if (inviteRes.ok) {
            const inviteData = await inviteRes.json();
            if (inviteData.valid && inviteData.friendFirstName) {
              setInviteDetails(inviteData);
              setChildFirstName(inviteData.friendFirstName);
              // Set invited child permissions (locked)
              setPermissions(INVITED_CHILD_PERMISSIONS);
            }
          }
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to load wizard. Please refresh and try again.');
        setLoading(false);
      }
    }

    initialize();
  }, [inviteCode, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (selectedChildId === 'new') {
        // Create new child
        if (!childFirstName.trim() || !childLastName.trim() || !childUsername.trim() || !childPassword.trim() || !childBirthdate.trim()) {
          throw new Error('Please fill in all child account fields including first name, last name, and birthdate.');
        }

        if (childPassword.length < 6) {
          throw new Error('Child password must be at least 6 characters.');
        }

        // Validate birthdate format and age
        const birthDate = new Date(childBirthdate);
        if (isNaN(birthDate.getTime())) {
          throw new Error('Please enter a valid birthdate.');
        }
        
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age >= 18) {
          throw new Error('Child accounts are for users under 18 years old.');
        }

        const createRes = await fetch('/api/parent/children', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: childFirstName.trim(),
            lastName: childLastName.trim(),
            username: childUsername.trim(),
            password: childPassword,
            birthdate: childBirthdate, // CRITICAL: For age-gated cliqs
            permissions,
            inviteCode: inviteCode || undefined,
            isInvitedChild: isInvitedChild,
          }),
        });

        if (!createRes.ok) {
          const errorData = await createRes.json();
          throw new Error(errorData.message || 'Failed to create child account.');
        }

        setCurrentStep('success');
        
        // If this was from an invite, accept the invite
        if (inviteCode) {
          try {
            await fetch('/api/accept-invite', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: inviteCode }),
            });
          } catch (err) {
            console.warn('Failed to accept invite (non-fatal):', err);
          }
        }

        // Redirect to success or dashboard
        setTimeout(() => {
          router.push('/parents/hq/dashboard');
        }, 2000);

      } else {
        // Update existing child permissions
        const updateRes = await fetch(`/api/parent/children/${selectedChildId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissions }),
        });

        if (!updateRes.ok) {
          throw new Error('Failed to update child permissions.');
        }

        // If this was from an invite, accept it for the existing child
        if (inviteCode) {
          try {
            await fetch('/api/accept-invite', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                code: inviteCode,
                childId: selectedChildId 
              }),
            });
          } catch (err) {
            console.warn('Failed to accept invite (non-fatal):', err);
          }
        }

        // Move to permissions step
        setCurrentStep('permissions');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setSubmitting(false);
    }
  };

  const updatePermission = (key: keyof ChildPermissions, value: boolean) => {
    setPermissions(prev => ({ ...prev, [key]: value }));
  };

  // Handle parent signup
  const handleParentSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Validate form
      if (!parentData.firstName || !parentData.lastName || !parentData.email || !parentData.birthdate || !parentData.password) {
        throw new Error('Please fill in all required fields.');
      }

      if (parentData.password !== parentData.confirmPassword) {
        throw new Error('Passwords do not match.');
      }

      // Create parent account
      const signupRes = await fetch('/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: parentData.firstName,
          lastName: parentData.lastName,
          email: parentData.email,
          birthdate: parentData.birthdate,
          password: parentData.password,
          context: 'parent_invite',
          inviteCode: inviteCode
        }),
      });

      if (!signupRes.ok) {
        const errorData = await signupRes.json();
        throw new Error(errorData.message || 'Failed to create parent account.');
      }

      // Account created successfully - move to plan selection
      setCurrentStep('plan-selection');
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle safety agreement acceptance
  const handleSafetyAgreement = async () => {
    setSubmitting(true);
    try {
      // Mark safety agreement as accepted and complete the flow
      setCurrentStep('success');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading Parents HQ...</p>
      </div>
    );
  }

  // Render parent signup step
  if (currentStep === 'parent-signup') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👨‍👩‍👧‍👦</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to Cliqstr!</h1>
            <p className="text-gray-600 mt-2">
              To approve your child's participation, please create a parent account.
            </p>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                ✓ No charges for invited users<br/>
                Credit card required for verification only
              </p>
            </div>
          </div>

          <form onSubmit={handleParentSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={parentData.firstName}
                  onChange={(e) => setParentData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                  disabled={submitting}
                  placeholder="First Name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={parentData.lastName}
                  onChange={(e) => setParentData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                  disabled={submitting}
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Parent/Guardian Email *</Label>
              <Input
                id="email"
                type="email"
                value={parentData.email}
                onChange={(e) => setParentData(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled={submitting}
                placeholder="your.email@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">Must match the email address that received this invite</p>
            </div>

            <div>
              <Label htmlFor="birthdate">Date of Birth *</Label>
              <Input
                id="birthdate"
                type="date"
                value={parentData.birthdate}
                onChange={(e) => setParentData(prev => ({ ...prev, birthdate: e.target.value }))}
                required
                disabled={submitting}
              />
              <p className="text-xs text-gray-500 mt-1">Required to verify you are 18 or older</p>
            </div>

            <div>
              <Label htmlFor="password">Create Password *</Label>
              <Input
                id="password"
                type="password"
                value={parentData.password}
                onChange={(e) => setParentData(prev => ({ ...prev, password: e.target.value }))}
                required
                disabled={submitting}
                placeholder="Create a secure password"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={parentData.confirmPassword}
                onChange={(e) => setParentData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                disabled={submitting}
                placeholder="Confirm your password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={submitting}
              className="w-full"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Creating Parent Account...
                </span>
              ) : (
                'Create Parent Account & Continue'
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Already have an account? <a href="/sign-in" className="text-blue-600 hover:underline">Sign in instead</a>
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Render plan selection step (Modal 1b)
  if (currentStep === 'plan-selection') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💳</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Plan Selection</h1>
            <p className="text-gray-600 mt-2">
              Choose your plan to continue. As an invited parent, you get free access!
            </p>
          </div>

          <div className="space-y-6 mb-8">
            {/* Free Invited Plan */}
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 relative">
              <div className="absolute -top-3 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                ✨ Recommended for You
              </div>
              <div className="pt-2">
                <h3 className="font-bold text-green-900 text-xl mb-2">Free Invited Plan</h3>
                <p className="text-green-800 mb-4">Perfect for invited parents - no charges!</p>
                <ul className="text-sm text-green-800 space-y-2 mb-4">
                  <li>• ✅ Full parental monitoring tools</li>
                  <li>• ✅ Silent monitoring & red alerts</li>
                  <li>• ✅ Child safety permissions</li>
                  <li>• ✅ Complete dashboard access</li>
                  <li>• ✅ Credit card required for verification only</li>
                </ul>
                <div className="text-2xl font-bold text-green-900">FREE</div>
                <p className="text-xs text-green-700">No charges - verification only</p>
              </div>
            </div>

            {/* Basic Test Plan */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-blue-900 text-xl mb-2">Basic Test Plan</h3>
              <p className="text-blue-800 mb-4">Test the full plan experience (will be updated when Stripe is working)</p>
              <ul className="text-sm text-blue-800 space-y-2 mb-4">
                <li>• ✅ Everything in Free Plan</li>
                <li>• ✅ Priority support</li>
                <li>• ✅ Advanced reporting</li>
                <li>• ✅ Multiple child accounts</li>
                <li>• ✅ Enhanced safety features</li>
              </ul>
              <div className="text-2xl font-bold text-blue-900">FREE (Test)</div>
              <p className="text-xs text-blue-700">Testing plan flow - no charges</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 text-center">
              <strong>Note:</strong> Credit card verification is required for all plans, including free ones. 
              This helps us maintain a safe environment for children.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button 
              onClick={() => setCurrentStep('parent-signup')}
              variant="outline"
              disabled={submitting}
              className="flex-1"
            >
              Back to Parent Info
            </Button>
            <Button 
              onClick={() => setCurrentStep('child-setup')}
              disabled={submitting}
              className="flex-1"
            >
              Continue with Free Plan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome to the Cliqstr Family!</h1>
            <p className="text-lg text-gray-600 mt-2">
              {childFirstName}'s account has been created successfully and they can now join their Cliq!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Section 1: Child Sign-In Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <span>🚀</span> Please Help Your Child Sign In
              </h3>
              <div className="text-sm text-blue-800 space-y-3">
                <p className="font-medium">Go to <strong>cliqstr.com</strong> and help {childFirstName} sign in:</p>
                <ul className="space-y-2 ml-4">
                  <li>• <strong>Username:</strong> {childUsername}</li>
                  <li>• <strong>Password:</strong> The password you just created</li>
                  <li>• Help them complete their profile setup</li>
                  <li>• Guide them to join their invited Cliq</li>
                  <li>• Review privacy settings together</li>
                </ul>
              </div>
            </div>

            {/* Section 2: Silent Monitoring Instructions */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <span>👁️</span> How to Silent Monitor Your Child
              </h3>
              <div className="text-sm text-purple-800 space-y-3">
                <p className="font-medium">Access your parental monitoring tools:</p>
                <ul className="space-y-2 ml-4">
                  <li>• <strong>Dashboard:</strong> View real-time activity and conversations</li>
                  <li>• <strong>Red Alerts:</strong> Receive instant notifications for safety concerns</li>
                  <li>• <strong>Friend Monitoring:</strong> Review new connections and friend requests</li>
                  <li>• <strong>Content Review:</strong> Monitor posts, messages, and interactions</li>
                  <li>• <strong>Safety Reports:</strong> Weekly summaries of your child's activity</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Parent Responsibilities */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-red-900 mb-4 flex items-center gap-2">
              <span>⚖️</span> Parent Responsibilities
            </h3>
            <div className="text-sm text-red-800 space-y-4">
              <p className="font-medium">
                We have developed Cliqstr with comprehensive protections including privacy rules, age gating, 
                AI moderation, and human backup to help keep your child safe while on Cliqstr. However, 
                <strong> ultimately you as parent/guardian are primarily responsible</strong> for your child's online safety.
              </p>
              <p>
                The red alert system, when activated, will notify both you and our moderators when your child 
                perceives danger. <strong>Please take these alerts seriously</strong> and respond immediately.
              </p>
              <div className="bg-red-100 border border-red-300 rounded p-3 mt-4">
                <p className="font-bold text-red-900">Remember:</p>
                <ul className="mt-2 space-y-1">
                  <li>• You are the first line of defense for your child's safety</li>
                  <li>• Our tools assist but cannot replace active parental supervision</li>
                  <li>• Regular monitoring and open communication are essential</li>
                  <li>• Red alerts require immediate attention and action</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button 
              onClick={() => router.push('/parents/dashboard')}
              className="px-8 py-3 text-lg"
            >
              Go to Parent Dashboard
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              You can access your monitoring tools and {childFirstName}'s activity reports anytime from your dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Parents HQ
            </h1>
            {isInvitedChild ? (
              <div>
                <p className="text-gray-600 mb-2">
                  Setting up <strong>{inviteDetails?.friendFirstName}</strong>'s account
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  📧 Invited to join: <strong>{inviteDetails?.cliqName || 'Cliq'}</strong>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">
                Create and manage your child's account and safety permissions
              </p>
            )}
          </div>

          {/* Child Selection (only show if not invited child and has existing children) */}
          {!isInvitedChild && existingChildren.length > 0 && (
            <div className="mb-6">
              <Label htmlFor="childSelect">Select Child</Label>
              <select
                id="childSelect"
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="new">+ Create New Child Account</option>
                {existingChildren.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.firstName} (@{child.username})
                  </option>
                ))}
              </select>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Child Account Creation (only for new children) */}
            {selectedChildId === 'new' && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  👶 Child Account Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="childFirstName">Child's First Name *</Label>
                    <Input
                      id="childFirstName"
                      type="text"
                      value={childFirstName}
                      onChange={(e) => setChildFirstName(e.target.value)}
                      placeholder="Enter first name"
                      required
                      disabled={submitting || isInvitedChild} // Lock for invited children
                      className={`mt-1 ${isInvitedChild ? 'bg-gray-100' : ''}`}
                    />
                    {isInvitedChild && (
                      <p className="text-xs text-gray-500 mt-1">
                        🔒 Name from invitation (locked)
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="childLastName">Child's Last Name *</Label>
                    <Input
                      id="childLastName"
                      type="text"
                      value={childLastName}
                      onChange={(e) => setChildLastName(e.target.value)}
                      placeholder="Enter last name"
                      required
                      disabled={submitting}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Helps friends identify your child when receiving invites
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="childUsername">Username *</Label>
                    <Input
                      id="childUsername"
                      type="text"
                      value={childUsername}
                      onChange={(e) => setChildUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      placeholder="username123"
                      required
                      disabled={submitting}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Letters and numbers only, automatically lowercase
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="childPassword">Child's Password *</Label>
                    <div className="relative">
                      <Input
                        id="childPassword"
                        type={showChildPassword ? "text" : "password"}
                        value={childPassword}
                        onChange={(e) => setChildPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        required
                        disabled={submitting}
                        className="mt-1 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowChildPassword(!showChildPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        disabled={submitting}
                      >
                        {showChildPassword ? (
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="childBirthdate">Child's Birthdate *</Label>
                    <Input
                      id="childBirthdate"
                      type="date"
                      value={childBirthdate}
                      onChange={(e) => setChildBirthdate(e.target.value)}
                      required
                      disabled={submitting}
                      className="mt-1"
                      max={new Date().toISOString().split('T')[0]} // Prevent future dates
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      🔒 Required for age-gated cliqs
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Safety Permissions */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  🛡️ Safety Permissions
                </h3>
                {isInvitedChild && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    Invited Child Safety Mode
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Permissions */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Content & Communication</h4>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canPost}
                      onChange={(e) => updatePermission('canPost', e.target.checked)}
                      disabled={submitting}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Can post content</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canComment}
                      onChange={(e) => updatePermission('canComment', e.target.checked)}
                      disabled={submitting}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Can comment on posts</span>
                  </label>

                  <label className={`flex items-center gap-3 ${isInvitedChild ? 'opacity-50' : 'cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      checked={permissions.canInviteFriends}
                      onChange={(e) => updatePermission('canInviteFriends', e.target.checked)}
                      disabled={submitting || isInvitedChild}
                      className="w-4 h-4"
                    />
                    <span className="text-sm flex items-center gap-1">
                      Can invite friends
                      {isInvitedChild && <span className="text-xs">🔒</span>}
                    </span>
                  </label>
                </div>

                {/* Advanced Permissions */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Cliq Management</h4>
                  
                  <label className={`flex items-center gap-3 ${isInvitedChild ? 'opacity-50' : 'cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      checked={permissions.canJoinNewCliqs}
                      onChange={(e) => updatePermission('canJoinNewCliqs', e.target.checked)}
                      disabled={submitting || isInvitedChild}
                      className="w-4 h-4"
                    />
                    <span className="text-sm flex items-center gap-1">
                      Can join new Cliqs
                      {isInvitedChild && <span className="text-xs">🔒</span>}
                    </span>
                  </label>

                  <label className={`flex items-center gap-3 ${isInvitedChild ? 'opacity-50' : 'cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      checked={permissions.canCreateCliqs}
                      onChange={(e) => updatePermission('canCreateCliqs', e.target.checked)}
                      disabled={submitting || isInvitedChild}
                      className="w-4 h-4"
                    />
                    <span className="text-sm flex items-center gap-1">
                      Can create Cliqs
                      {isInvitedChild && <span className="text-xs">🔒</span>}
                    </span>
                  </label>
                </div>

                {/* Media Permissions */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Media & Games</h4>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canUploadImages}
                      onChange={(e) => updatePermission('canUploadImages', e.target.checked)}
                      disabled={submitting}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Can upload images</span>
                  </label>

                  <label className={`flex items-center gap-3 ${isInvitedChild ? 'opacity-50' : 'cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      checked={permissions.canUploadVideos}
                      onChange={(e) => updatePermission('canUploadVideos', e.target.checked)}
                      disabled={submitting || isInvitedChild}
                      className="w-4 h-4"
                    />
                    <span className="text-sm flex items-center gap-1">
                      Can upload videos
                      {isInvitedChild && <span className="text-xs">🔒</span>}
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canPlayGames}
                      onChange={(e) => updatePermission('canPlayGames', e.target.checked)}
                      disabled={submitting}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Can play games</span>
                  </label>
                </div>
              </div>

              {/* Invited Child Explanation */}
              {isInvitedChild && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <p className="text-sm text-orange-800">
                    <strong>🔒 Invited Child Safety:</strong> Some permissions are locked for invited children to ensure safer participation. Your child can only join the Cliq they were invited to and cannot invite others or upload videos.
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={submitting}
              className="w-full"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  {selectedChildId === 'new' ? 'Creating Account...' : 'Updating Permissions...'}
                </span>
              ) : (
                selectedChildId === 'new' 
                  ? (isInvitedChild ? `Create ${childFirstName}'s Account & Join Cliq` : 'Create Child Account')
                  : 'Update Permissions'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
