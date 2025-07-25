# 📘 CURRENT APP FLOWS - As Implemented
*Last Updated: July 25, 2025*

This document describes the ACTUAL flows as implemented in the codebase, not theoretical designs.

---

## 🔐 SIGN-UP FLOWS

### 1. Initial Sign-Up (`/sign-up`)
**File**: `src/app/sign-up/sign-up-form.tsx`

#### Step 1: Age Determination
- User provides: firstName, lastName, birthdate
- System calculates age
- If age < 18 → Child flow
- If age >= 18 → Adult flow

#### Child Flow (Under 18)
1. **Parent Email Collection**
   - Child enters parent/guardian email
   - API: `POST /api/parent-approval/request`
   - Creates pending child account
   - Sends approval email to parent
   - Redirects to `/awaiting-approval`

2. **Parent Approval Process**
   - Parent receives email with approval link
   - Link format: `/parent-approval?code=XXX&childId=YYY`
   - Parent creates account or signs in
   - API: `POST /api/parent-approval/complete`
   - Parent redirected to `/parents/hq`
   - Child account marked as approved

3. **Child Credential Setup**
   - Parent sets username/password for child in `/parents/hq`
   - API: `POST /api/parent/child-credentials/update`
   - Child can now sign in

#### Adult Flow (18+)
1. **Credential Creation**
   - Adult enters email and password
   - API: `POST /api/sign-up`
   - Creates unverified account
   - Sends verification email
   - Redirects to `/verification-pending`

2. **Email Verification**
   - User clicks verification link
   - API: `GET /api/verify-email?token=XXX`
   - Account marked as verified
   - Redirects to `/choose-plan`

3. **Plan Selection**
   - User selects plan (currently test plan only)
   - API: `POST /api/user/plan`
   - Account marked as approved
   - Redirects to `/my-cliqs-dashboard`

---

## 👤 PROFILE CREATION

### Profile vs Account Distinction
- **Account**: Authentication and billing entity
- **Profile**: Social presence within cliqs

### Profile Creation Flow (`/profile/create`)
**Component**: `src/components/CreateProfileForm.tsx`

1. **Required Fields**:
   - Username (unique)
   - First Name
   - Last Name
   - About (bio)
   - Avatar (optional)
   - Banner Image (optional)

2. **Process**:
   - API: `POST /api/profile/create`
   - Creates Profile linked to Account
   - Redirects to `/my-cliqs-dashboard`

3. **Profile Display**:
   - Public URL: `/profile/[username]`
   - Component: `src/components/NewProfileClient.tsx`
   - Shows: avatar, banner, name, username, bio, cliqs

---

## 🎯 CLIQ CREATION & MANAGEMENT

### Cliq Creation (`/cliqs/build`)
**Component**: `src/app/cliqs/build/build-cliq-client.tsx`

1. **Required Information**:
   - Name
   - Description (optional)
   - Privacy Level:
     - Private: Invite only
     - Semi-Private: Request to join
     - Public: Open (child permission required)
   - Cover Image (optional)

2. **Child Restrictions**:
   - If user.role === 'Child' && privacy === 'public'
   - Checks `ChildSettings.canCreatePublicCliqs`
   - Returns 403 if permission denied

3. **Creation Process**:
   - API: `POST /api/cliqs/create`
   - Creator automatically becomes Owner
   - Creates membership record
   - Redirects to cliq page

### Cliq Structure
```typescript
Cliq {
  id: string
  name: string
  description?: string
  privacy: 'private' | 'semi_private' | 'public'
  coverImage: string
  ownerId: string (User.id)
  memberships: CliqMembership[]
}

CliqMembership {
  userId: string
  cliqId: string
  role: 'Owner' | 'Moderator' | 'Member'
  joinedAt: DateTime
}
```

### Cliq Display (`/cliqs/[id]`)
- Shows cliq details, posts, members
- Owner sees edit button
- Members can invite others (if allowed)

---

## 🔗 INVITE FLOWS

### Adult-to-Adult Invite
1. Sender creates invite in cliq
2. API: `POST /api/invite/create`
3. Recipient receives email
4. Clicks link → `/invite/accept?code=XXX`
5. Signs up or signs in
6. Automatically joins cliq

### Adult-to-Child Invite
1. Requires `trustedAdultContact` (parent email)
2. Invite sent to parent, not child
3. Parent must approve before child can join
4. If child not registered, triggers child sign-up flow

### Child Invite Permissions
- Controlled by `ChildSettings.canSendInvites`
- If `inviteRequiresApproval = true`, parent must approve
- All child invites logged for safety

---

## 🚨 SECURITY FEATURES

### Session Management (NEW - July 25, 2025)
- Uses iron-session for encrypted cookies
- 30-minute timeout
- Session data: `{ userId: string, createdAt: number }`
- No raw user IDs exposed

### Role-Based Access
- Every request checks `getCurrentUser()`
- Returns user with role, profile, account
- Middleware enforces permissions

### Child Protections
- Cannot self-approve anything
- Cannot bypass parent controls
- Cannot create public cliqs without permission
- All actions logged

---

## 📁 KEY FILES REFERENCE

### Authentication
- `/src/app/api/sign-up/route.ts` - Account creation
- `/src/app/api/sign-in/route.ts` - Login with session
- `/src/lib/auth/getCurrentUser.ts` - Session retrieval
- `/src/lib/auth/session-config.ts` - Iron session config

### Profiles
- `/src/app/api/profile/create/route.ts` - Profile creation
- `/src/components/CreateProfileForm.tsx` - Profile form UI
- `/src/components/NewProfileClient.tsx` - Profile display

### Cliqs
- `/src/app/api/cliqs/create/route.ts` - Cliq creation
- `/src/app/cliqs/build/build-cliq-client.tsx` - Creation UI
- `/src/components/cliqs/CliqCard.tsx` - Cliq display card

### Parent Controls
- `/src/app/parents/hq/page.tsx` - Parent dashboard
- `/src/components/parents/ParentsHQPage.tsx` - HQ component
- `/src/app/api/parent/settings/update/route.ts` - Child settings

---

## 🔄 TYPICAL USER JOURNEYS

### Adult User Journey
1. Sign up → Email verify → Choose plan
2. Create profile (username, bio, images)
3. Land on My Cliqs Dashboard
4. Create or join cliqs
5. Post content, invite friends

### Child User Journey
1. Parent receives invite or child tries to sign up
2. Parent approves and creates child account
3. Parent sets child username/password
4. Child signs in → Creates profile
5. Child joins cliqs (with restrictions)
6. Parent monitors via Parents HQ

### Cliq Owner Journey
1. Create cliq with privacy settings
2. Customize appearance
3. Invite initial members
4. Moderate content
5. Manage member roles

---

## ⚠️ KNOWN ISSUES & INCOMPLETE FEATURES

1. **Stripe Integration**: Commented out, using test plans
2. **Email Verification**: Working but may need production testing
3. **File Uploads**: UploadThing integration recently fixed
4. **Search**: No global search implemented
5. **Notifications**: System exists but not fully implemented

---

This document reflects the ACTUAL implementation as of July 25, 2025.