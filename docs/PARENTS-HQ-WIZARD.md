# 🛡️ Parents HQ Multi-Step Wizard System

## Overview

The Parents HQ Wizard is a beautiful, user-friendly multi-step interface that guides users through setting up parental controls and creating child accounts on Cliqstr. It replaces the previous confusing single-page approach with a clear, progressive workflow.

## Features

### ✨ **Multi-Step Wizard Flow**
1. **Parent Account Upgrade** - Seamlessly upgrade Adult users to Parent role
2. **Child Account Creation** - Simple form to create child username and password
3. **Permission Setup** - Comprehensive safety settings with preset options
4. **Success & Completion** - Clear confirmation and next steps

### 🎨 **Beautiful UI/UX**
- Clean, modern design consistent with account management system
- Progress indicator showing current step and completion status
- Responsive layout that works on all devices
- Clear visual hierarchy and intuitive navigation
- APA compliance throughout the interface

### 🛡️ **Safety-First Design**
- Default to most restrictive permissions for child safety
- Clear explanations of each permission setting
- Preset options: Restrictive, Balanced, and Permissive
- Visual warnings for important safety considerations
- Silent monitoring enabled by default

## Architecture

### Components Structure
```
src/components/parents/
├── ParentsHQWizard.tsx          # Main wizard orchestrator
├── wizard/
│   ├── ParentUpgradeStep.tsx    # Step 1: Upgrade to parent
│   ├── ChildAccountStep.tsx     # Step 2: Create child account
│   ├── PermissionSetupStep.tsx  # Step 3: Set safety permissions
│   └── SuccessStep.tsx          # Step 4: Success and next steps
├── ParentsHQContent.tsx         # Original invite approval flow
└── ParentDashboard.tsx          # Ongoing child management
```

### API Routes
```
/api/account/upgrade-to-parent   # General parent account upgrade
/api/parent/children             # Child account creation and management
/api/auth/upgrade-to-parent      # Legacy invite-specific upgrade
```

## User Flow

### 🎯 **New Parent Setup**
1. Adult user visits `/parents/hq`
2. System detects user needs parent upgrade
3. **Step 1**: Parent Upgrade - Clear explanation and one-click upgrade
4. **Step 2**: Child Account - Username/password creation with validation
5. **Step 3**: Permissions - Comprehensive safety settings with presets
6. **Step 4**: Success - Confirmation and dashboard access

### 🔄 **Existing Parent**
- Users with Parent role and existing children → Direct to dashboard
- Users with Parent role but no children → Skip to child creation step

### 📧 **Invite Approval Flow**
- URLs with `?inviteCode=xyz` → Use original `ParentsHQContent` for invite approval
- Maintains backward compatibility with existing invite links

## Permission System

### 🔒 **Default Safety Settings (Restrictive)**
```typescript
{
  canCreatePublicCliqs: false,      // No public content creation
  canCreatePrivateCliqs: true,      // Private friend groups OK
  canJoinPublicCliqs: false,        // No joining unknown groups
  canInviteOthers: false,           // No inviting strangers
  canInviteAdults: false,           // No adult contact
  requiresParentApproval: true,     // All invites need approval
  canUploadVideos: false,           // No video uploads
  canShareYouTubeVideos: false,     // No external content
  canAccessGames: false,            // No games/interactive features
  silentMonitoring: true,           // Full activity monitoring
}
```

### ⚖️ **Balanced Settings (Recommended)**
- Allows private cliqs and joining public ones
- Can invite other children (not adults)
- YouTube sharing and games enabled
- Still requires parent approval for invites
- Maintains full monitoring

### 🌟 **Permissive Settings (Older Children)**
- Full social features enabled
- Can create public content
- Can invite adults
- Optional parent approval
- Reduced monitoring

## Security & Compliance

### 🔐 **Authentication**
- Requires authenticated Adult or Parent user
- Blocks Child users from accessing Parents HQ
- Session validation on each step
- Automatic redirect to sign-in if unauthenticated

### 👶 **Child Safety**
- All child accounts created with synthetic emails
- Parent approval required by default for all social interactions
- Silent monitoring enabled for safety compliance
- APA-compliant permission structure
- Clear audit trail of all permission changes

### 🛡️ **Role Management**
- Permanent upgrade from Adult to Parent (cannot be reversed)
- Parent role enables access to all child management features
- Role-based UI rendering throughout the application
- Proper permission inheritance and validation

## Technical Implementation

### State Management
```typescript
interface ChildData {
  username: string;
  password: string;
  permissions: PermissionSet;
}

type WizardStep = 'upgrade' | 'create-child' | 'permissions' | 'success' | 'dashboard';
```

### Error Handling
- Comprehensive form validation with real-time feedback
- Network error recovery with retry options
- Clear error messages for all failure scenarios
- Graceful fallbacks for API failures

### Performance
- Lazy loading of wizard steps
- Optimized re-renders with proper state management
- Minimal API calls with efficient caching
- Progressive enhancement for better UX

## Integration Points

### 🔗 **User Dropdown Menu**
- "Parent Controls" link for existing parents
- Seamless navigation to Parents HQ
- Role-based menu item visibility

### 📊 **Account Management**
- Parent role displayed in account settings
- Integration with billing and subscription management
- Child account overview in parent dashboard

### 🎯 **Child Dashboard**
- Children see appropriate restricted interface
- Parent-controlled feature availability
- Approval request system for restricted actions

## Testing Guidelines

### 🧪 **Unit Tests**
- Form validation logic
- Permission preset configurations
- API response handling
- Error state management

### 🔍 **Integration Tests**
- Complete wizard flow from Adult to Parent with child
- Permission application and enforcement
- Role upgrade database transactions
- Session management across steps

### 👥 **User Acceptance Tests**
- Parent onboarding experience
- Child account creation and first login
- Permission modification workflows
- Multi-child family scenarios

## Deployment Considerations

### 🚀 **Database**
- No schema changes required
- Uses existing User, Account, and permission structures
- Backward compatible with existing parent/child relationships

### 🌐 **Environment**
- Works with existing session management
- Compatible with current authentication system
- No additional environment variables needed

### 📱 **Mobile Responsiveness**
- Fully responsive design
- Touch-friendly interface elements
- Optimized for mobile parent usage

## Future Enhancements

### 🔮 **Planned Features**
- Bulk child account creation
- Advanced permission scheduling (time-based restrictions)
- Child activity analytics and reports
- Integration with external parental control tools
- Two-factor authentication for parent actions

### 🎨 **UI Improvements**
- Dark mode support
- Accessibility enhancements
- Internationalization support
- Custom permission templates

## Support & Documentation

### 📚 **User Guides**
- Parent onboarding tutorial
- Child safety best practices
- Permission setting explanations
- Troubleshooting common issues

### 🛠️ **Developer Resources**
- API documentation for parent/child endpoints
- Component usage examples
- Permission system architecture
- Testing utilities and helpers

---

## Summary

The Parents HQ Wizard transforms the complex parent account setup and child management process into a beautiful, intuitive experience. By breaking down the workflow into clear steps with safety-first defaults, we ensure both parent satisfaction and child protection while maintaining full APA compliance.

The system is designed to scale with families of any size while providing the comprehensive controls parents need to keep their children safe on social media.

// Modified flows due to migration from Prisma/Neon to Convex - 09-17-25