# Phase 1 — Auth Flows Analysis Report

## Current Auth Flow Structure

### Adult Signup Flow
**Entry Point**: `/sign-up` → `SignUpForm` component
**API Endpoint**: `POST /api/sign-up`
**Convex Mutations**: 
- `users.createUserWithAccount` (creates user + account in transaction)
- `myProfiles.createProfile` (creates social profile)

**Expected Data Creation**:
1. `users` table: email, password, isVerified, isParent, timestamps
2. `accounts` table: userId, birthdate, role="Adult", isApproved=true, plan, timestamps
3. `myProfiles` table: username, firstName, lastName, birthdate, userId

**Flow Steps**:
1. User fills firstName, lastName, birthdate → role selection
2. Selects "Adult" → credentials form (email, password)
3. POST to `/api/sign-up` with role="Adult"
4. Creates user + account + profile in Convex
5. Sends verification email
6. Redirects to `/verification-pending`

### Child Signup Flow (New Parent)
**Entry Point**: `/sign-up` → `SignUpForm` component
**API Endpoint**: `POST /api/parent-approval/request`
**Convex Mutations**:
- `pendingChildSignups.createParentApproval` (creates approval record)

**Expected Data Creation**:
1. `parentApprovals` table: childFirstName, childLastName, childBirthdate, parentEmail, approvalToken, status="pending", context="direct_signup"

**Flow Steps**:
1. User fills firstName, lastName, birthdate → role selection
2. Selects "Child" → parent email form
3. POST to `/api/parent-approval/request`
4. Creates parent approval record
5. Sends email to parent
6. Redirects to `/awaiting-approval`

### Parent Approval Flow (New Parent)
**Entry Point**: Email link → `/invite/accept?code={approvalToken}`
**API Endpoints**: 
- `GET /api/parent-approval/accept` (validates token)
- `POST /api/parent-approval/signup` (creates parent account)
- `POST /api/parent-approval/plan` (selects plan)

**Expected Data Creation**:
1. `users` table: parent email, password, isVerified=true, isParent=true
2. `accounts` table: userId, birthdate, role="Parent", isApproved=true, plan
3. `parentLinks` table: parentId, childId, email, type="approval"

**Flow Steps**:
1. Parent clicks email link
2. Validates approval token
3. Parent signup form (firstName, lastName, email, password, birthdate)
4. Creates parent account
5. Plan selection
6. Redirects to Parents HQ for child setup

## Required Testing Evidence

### Adult Signup Test
**Test Steps**:
1. Go to `/sign-up`
2. Fill: firstName="Test", lastName="Adult", birthdate="1990-01-01"
3. Select "Adult" role
4. Fill: email="testadult@example.com", password="testpass123"
5. Submit form

**Expected Convex Data**:
- `users`: 1 new row with email="testadult@example.com", isParent=false
- `accounts`: 1 new row with role="Adult", isApproved=true
- `myProfiles`: 1 new row with firstName="Test", lastName="Adult"

### Child Signup Test (New Parent)
**Test Steps**:
1. Go to `/sign-up`
2. Fill: firstName="Test", lastName="Child", birthdate="2010-01-01"
3. Select "Child" role
4. Fill: parentEmail="testparent@example.com"
5. Submit form

**Expected Convex Data**:
- `parentApprovals`: 1 new row with childFirstName="Test", childLastName="Child", parentEmail="testparent@example.com", status="pending"

### Parent Approval Test (New Parent)
**Test Steps**:
1. Use approval token from child signup
2. Go to `/invite/accept?code={approvalToken}`
3. Fill parent signup form
4. Select plan
5. Complete child setup in Parents HQ

**Expected Convex Data**:
- `users`: 1 new parent row
- `accounts`: 1 new parent account with role="Parent"
- `parentLinks`: 1 new row linking parent to child
- `parentApprovals`: status updated to "approved"

## Current Issues Identified

1. **Missing Email Sending**: No evidence of email service integration in current code
2. **Stripe Integration**: Plan selection references Stripe but needs stubbing for testing
3. **Session Management**: Uses iron-session but may need verification
4. **Invite Flow**: Adult invites may not be properly integrated with cliq creation

## Next Steps for Phase 2

1. Verify Convex functions are deployed and accessible
2. Test each flow manually and capture Convex Data tab screenshots
3. Document any missing pieces or broken flows
4. Identify duplicate/unused files for cleanup

## Files to Monitor

**Core Auth Files**:
- `src/app/sign-up/sign-up-form.tsx`
- `src/app/api/sign-up/route.ts`
- `src/app/api/parent-approval/request/route.ts`
- `src/app/api/parent-approval/signup/route.ts`
- `src/app/api/parent-approval/plan/route.ts`

**Convex Functions**:
- `convex/users.ts`
- `convex/accounts.ts`
- `convex/pendingChildSignups.ts`
- `convex/parentLinks.ts`

**Schema Tables**:
- `users`, `accounts`, `myProfiles`, `parentApprovals`, `parentLinks`
