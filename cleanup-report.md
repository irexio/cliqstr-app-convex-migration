# Phase 2 — Repo Audit Report

## Summary
Comprehensive audit of API routes, page routes, and potential duplicates/unused files in the Cliqstr codebase.

## API Routes Analysis (41 total)

### Authentication Routes
- ✅ `api/sign-in/route.ts` - Main login endpoint
- ✅ `api/sign-up/route.ts` - Main signup endpoint  
- ✅ `api/sign-out/route.ts` - Logout endpoint
- ✅ `api/auth/status/route.ts` - Auth status check
- ✅ `api/auth/clear-session/route.ts` - Session cleanup

### Parent Approval System
- ✅ `api/parent-approval/signup/route.ts` - Parent signup from child invite
- ✅ `api/parent-approval/check/route.ts` - Check approval status
- ✅ `api/parent-approval/accept/route.ts` - Accept child signup
- ✅ `api/parent-approval/request/route.ts` - Request parent approval
- ✅ `api/parent-approval/plan/route.ts` - Plan selection for parents

### Invite System
- ✅ `api/invites/create/route.ts` - Create invites
- ⚠️ `api/invites/validate/route-convex.ts` - **POTENTIAL DUPLICATE** (see issues below)

### Profile Management
- ✅ `api/profile/create/route.ts` - Create user profile
- ✅ `api/profile/me/route.ts` - Get current user profile

### Cliq Management
- ✅ `api/cliqs/route.ts` - List cliqs
- ✅ `api/cliqs/create/route.ts` - Create cliq
- ✅ `api/cliqs/[id]/route.ts` - Get/update specific cliq
- ✅ `api/cliqs/[id]/join/route.ts` - Join cliq

### Admin Routes
- ✅ `api/admin/users/route.ts` - Admin user management
- ✅ `api/admin/users/[userId]/route.ts` - Admin user operations
- ✅ `api/admin/cliqs/route.ts` - Admin cliq management
- ✅ `api/admin/cliqs/[cliqId]/route.ts` - Admin cliq operations
- ✅ `api/admin/promote/route.ts` - Promote users to admin

### Billing/Stripe
- ✅ `api/create-checkout-session/route.ts` - Stripe checkout
- ✅ `api/create-setup-intent/route.ts` - Stripe setup intent
- ✅ `api/user/plan/route.ts` - User plan management

### Email/Verification
- ✅ `api/verify-email/route.ts` - Email verification
- ✅ `api/resend-verification/route.ts` - Resend verification
- ✅ `api/reset-password/route.ts` - Password reset
- ✅ `api/send-reset-email/route.ts` - Send reset email
- ✅ `api/account/change-password/route.ts` - Change password

### File Upload
- ✅ `api/uploadthing/route.ts` - Main upload endpoint
- ⚠️ `api/test-uploadthing/route.ts` - **TEST ROUTE** (see issues below)
- ⚠️ `api/debug-uploadthing/route.ts` - **DEBUG ROUTE** (see issues below)

### Debug Routes (7 total)
- ⚠️ `api/debug/check-data/route.ts` - **DEBUG ROUTE**
- ⚠️ `api/debug/session-test/route.ts` - **DEBUG ROUTE**
- ⚠️ `api/debug/auth-status/route.ts` - **DEBUG ROUTE**
- ⚠️ `api/debug/clear-all-data/route.ts` - **DEBUG ROUTE**
- ⚠️ `api/debug/cleanup-test-data/route.ts` - **DEBUG ROUTE**
- ⚠️ `api/dev/reset-rate-limit/route.ts` - **DEV ROUTE**

### Parent Management
- ✅ `api/parent/children/route.ts` - Parent child management

### Posts
- ✅ `api/posts/create/route.ts` - Create posts

## Page Routes Analysis (70 total)

### Core Pages
- ✅ `page.tsx` - Homepage
- ✅ `sign-in/page.tsx` - Sign in page
- ✅ `sign-up/page.tsx` - Sign up page
- ✅ `my-cliqs-dashboard/page.tsx` - Main dashboard

### Profile Pages
- ✅ `profile/page.tsx` - Profile view
- ✅ `profile/create/page.tsx` - Create profile
- ✅ `profile/edit/page.tsx` - Edit profile
- ✅ `profile/[username]/page.tsx` - User profile view

### Cliq Pages
- ✅ `cliqs/build/page.tsx` - Build cliq
- ✅ `cliqs/create/page.tsx` - Create cliq
- ✅ `cliqs/feed/page.tsx` - Cliq feed
- ✅ `cliqs/[id]/page.tsx` - View cliq
- ✅ `cliqs/[id]/edit/page.tsx` - Edit cliq
- ✅ `cliqs/[id]/members/page.tsx` - Cliq members
- ✅ `cliqs/[id]/invite/page.tsx` - Invite to cliq
- ✅ `cliqs/[id]/member-actions/page.tsx` - Member actions

### Parent HQ Pages
- ✅ `parents/hq/page.tsx` - Parent HQ main
- ✅ `parents/hq/dashboard/page.tsx` - Parent dashboard
- ✅ `parents/hq/help/page.tsx` - Parent help
- ✅ `parents/hq/success/page.tsx` - Parent success

### Invite Flow Pages
- ✅ `invite/accept/page.tsx` - Accept invite
- ✅ `invite/declined/page.tsx` - Invite declined
- ✅ `invite/invalid/page.tsx` - Invalid invite
- ✅ `invite/manual/page.tsx` - Manual invite
- ✅ `invite/parent/signup/page.tsx` - Parent signup from invite
- ✅ `invite/sent/page.tsx` - Invite sent confirmation

### Account Management
- ✅ `account/page.tsx` - Account settings
- ✅ `account/email/page.tsx` - Email settings
- ✅ `account/password/page.tsx` - Password settings
- ✅ `account/security/page.tsx` - Security settings

### Verification/Onboarding
- ✅ `verify-email/page.tsx` - Email verification
- ✅ `verification-success/page.tsx` - Verification success
- ✅ `verification-pending/page.tsx` - Verification pending
- ✅ `verification-error/page.tsx` - Verification error
- ✅ `verify-parent/page.tsx` - Parent verification
- ✅ `verify-card/page.tsx` - Card verification
- ✅ `email-confirmation/page.tsx` - Email confirmation

### Status Pages
- ✅ `awaiting-approval/page.tsx` - Child awaiting approval
- ✅ `child-account-created/page.tsx` - Child account created
- ✅ `suspended/page.tsx` - Account suspended
- ✅ `not-authorized/page.tsx` - Not authorized

### Join Flow
- ✅ `join/page.tsx` - Join cliq
- ✅ `join/invalid/page.tsx` - Invalid join
- ✅ `join/expired/page.tsx` - Expired join

### Plan Selection
- ✅ `choose-plan/page.tsx` - Choose plan

### Parent Signup
- ✅ `parent/signup/page.tsx` - Parent signup

### Child Onboarding
- ✅ `child/onboarding/page.tsx` - Child onboarding

### Static Pages
- ✅ `about/page.tsx` - About page
- ✅ `features/page.tsx` - Features page
- ✅ `how-it-works/page.tsx` - How it works
- ✅ `for-parents/page.tsx` - For parents
- ✅ `safety/page.tsx` - Safety page
- ✅ `privacy/page.tsx` - Privacy policy
- ✅ `terms/page.tsx` - Terms of service
- ✅ `pricing/page.tsx` - Pricing page
- ✅ `faqs/page.tsx` - FAQs

### Utility Pages
- ✅ `reset-password/page.tsx` - Reset password
- ✅ `forgot-password/page.tsx` - Forgot password
- ✅ `explore/page.tsx` - Explore page
- ✅ `waitlist/page.tsx` - Waitlist
- ✅ `home-preview/page.tsx` - Home preview
- ✅ `under-development/page.tsx` - Under development

### Admin Pages
- ✅ `admin/page.tsx` - Admin dashboard
- ✅ `sentinel/page.tsx` - Sentinel page

### Debug/Test Pages (6 total)
- ⚠️ `debug/session-check/page.tsx` - **DEBUG PAGE**
- ⚠️ `debug/invite-flow/page.tsx` - **DEBUG PAGE**
- ⚠️ `test-upload/page.tsx` - **TEST PAGE**
- ⚠️ `test-simple/page.tsx` - **TEST PAGE**
- ⚠️ `test-avatar/page.tsx` - **TEST PAGE**
- ⚠️ `session-ping/page.tsx` - **LEGACY PAGE** (see issues below)

## Issues Found

### 🔴 Critical Issues

1. **Potential Duplicate Invite Validation**
   - `api/invites/validate/route-convex.ts` - May duplicate functionality in main invite system
   - **Action**: Review and consolidate if duplicate

2. **Legacy Session Ping Page**
   - `session-ping/page.tsx` - Appears to be legacy auth flow page
   - **Action**: Verify if still needed or can be removed

### 🟡 Debug/Test Routes (13 total)
These should be moved to `/deprecated/` before production:

**API Debug Routes (6):**
- `api/debug/check-data/route.ts`
- `api/debug/session-test/route.ts` 
- `api/debug/auth-status/route.ts`
- `api/debug/clear-all-data/route.ts`
- `api/debug/cleanup-test-data/route.ts`
- `api/dev/reset-rate-limit/route.ts`

**API Test Routes (2):**
- `api/test-uploadthing/route.ts`
- `api/debug-uploadthing/route.ts`

**Page Debug Routes (5):**
- `debug/session-check/page.tsx`
- `debug/invite-flow/page.tsx`
- `test-upload/page.tsx`
- `test-simple/page.tsx`
- `test-avatar/page.tsx`

### 🟢 TODO Items Found (7 total)
- `api/invites/create/route.ts` - Email sending TODO
- `api/parent/children/route.ts` - Invite status update TODO
- `api/parent-approval/accept/route.ts` - Inviter notification TODO
- `components/Header/UserDropdown.tsx` - Suspend/delete account TODOs
- `components/parents/wizard/ServerDrivenWizard.tsx` - Multiple modal TODOs
- `app/account/security/page.tsx` - Active sessions TODO

## Recommendations

### Phase 3 Actions
1. **Move Debug Routes**: Move all 13 debug/test routes to `/deprecated/`
2. **Review Duplicates**: Investigate `api/invites/validate/route-convex.ts`
3. **Clean Legacy**: Review `session-ping/page.tsx` for removal
4. **Address TODOs**: Prioritize critical TODOs in invite and parent approval flows

### Production Readiness
- ✅ Core authentication flows are complete
- ✅ Parent approval system is comprehensive
- ✅ Cliq management is fully implemented
- ⚠️ Debug routes need cleanup before production
- ⚠️ Some TODOs in critical flows need attention

## File Count Summary
- **API Routes**: 41 total (34 production, 7 debug/test)
- **Page Routes**: 70 total (64 production, 6 debug/test)
- **Total Routes**: 111 (98 production, 13 debug/test)
- **Deprecated Folder**: 1 file (README only)

---
Refreshed scan: Confirmed `session-ping/page.tsx` remains legacy and unused by current flows; keep as prune candidate. No new duplicate routes detected. API `auth/status` is server-first and in use; middleware simplified as intended.

*Report generated on: 2025-09-18*
*Phase 2 Complete - Ready for Phase 3 Safe Prune*
