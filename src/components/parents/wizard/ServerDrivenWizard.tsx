'use client';

/**
 * 🎯 Sol's Clean Server-Driven Parents HQ Wizard
 * 
 * Server decides the step, wizard just renders the right modal.
 * After each successful POST, router.refresh() lets server pick next step.
 */

import ParentSignupModal from './ParentSignupModal';

// 🎯 Sol's Wizard Steps (server-driven)
type WizardStep = 'PARENT_SIGNUP' | 'UPGRADE_TO_PARENT' | 'PARENT_DOB' | 'CHILD_CREATE' | 'PERMISSIONS' | 'SUCCESS';

interface ServerDrivenWizardProps {
  initialStep: WizardStep;
  inviteCode?: string;
  prefillEmail?: string;
}

export default function ServerDrivenWizard({ 
  initialStep,
  inviteCode,
  prefillEmail = ''
}: ServerDrivenWizardProps) {

  // 🎯 Sol's Logic: Server decides step, wizard just renders
  switch (initialStep) {
    case 'PARENT_SIGNUP':
      return <ParentSignupModal prefillEmail={prefillEmail} />;
      
    case 'UPGRADE_TO_PARENT':
      // TODO: Handle existing user upgrade to Parent role
      return <ParentSignupModal prefillEmail={prefillEmail} />;
      
    case 'PARENT_DOB':
      // TODO: Create ParentDOBModal for missing birthdate
      return <div>Parent DOB Modal (TODO)</div>;
      
    case 'CHILD_CREATE':
      // TODO: Create ChildCreateModal 
      return <div>Child Create Modal (TODO)</div>;
      
    case 'PERMISSIONS':
      // TODO: Create PermissionsModal
      return <div>Permissions Modal (TODO)</div>;
      
    case 'SUCCESS':
      // TODO: Create SuccessModal
      return <div>Success Modal (TODO)</div>;
      
    default:
      return <ParentSignupModal prefillEmail={prefillEmail} />;
  }
}
