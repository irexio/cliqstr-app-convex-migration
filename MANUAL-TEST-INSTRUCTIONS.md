# Manual Test Instructions - Child Invite Flow

## Prerequisites
1. Dev server running: `npm run dev` (currently running on http://localhost:3000)
2. Database seeded with test data

## Test Case: Child Invite Flow (Fixed)

### Setup
1. Sign in as an adult/cliq owner
2. Create a cliq or use existing one
3. Send an invite to a child (requires parent email)

### Test Steps

#### Step 1: Send Child Invite
1. Go to your cliq
2. Click "Invite" 
3. Select "Child" as invite type
4. Enter:
   - Child's First Name: "Test"
   - Child's Last Name: "Child"
   - Parent's Email: Use a new email not in system
5. Send invite

#### Step 2: Parent Receives Invite
1. Check the parent email (or database for invite link)
2. Click the invite link (format: `/invite/[token]`)
3. **Expected**: Redirected to `/parents/hq#create-child`

#### Step 3: Parent Signup (THE FIX IS HERE)
1. You should see "Create your Parent account" form
2. Fill in:
   - First Name
   - Last Name  
   - Email (should be pre-filled)
   - Birthdate
   - Password
   - Select plan (invited-free)
3. Click "Create account"
4. **CRITICAL**: Page should reload and show "Create your child's account" form
   - **Before fix**: Page would freeze/hang at signup form
   - **After fix**: Page reloads with new session and shows child creation

#### Step 4: Create Child Account
1. Child's name should be pre-filled from invite
2. Enter:
   - Username for child
   - Child's birthdate
   - Password for child
3. Click "Create child account"
4. **Expected**: Redirect to `/parents/hq` dashboard

#### Step 5: Verify Success
1. Parent should see dashboard with their child listed
2. Check database:
   - Child user created
   - ParentLink established
   - Child added to cliq membership
   - Invite marked as used

## What Was Fixed

The issue was in `ParentsHQWithSignup.tsx`:
- **Before**: Used `router.refresh()` after parent signup
- **Problem**: Session wasn't being picked up, page stayed on signup form
- **Fix**: Changed to `window.location.href = '/parents/hq#create-child'`
- **Result**: Full page reload ensures session is read and next step shown

## Alternative Test: Existing Parent

If testing with an existing parent account:
1. Sign out
2. Click child invite link
3. You'll see parent signup
4. Instead of creating new account, click "Sign in" 
5. Sign in with existing parent account
6. Should go directly to child creation form

## Console Logs to Watch

Open browser DevTools console to see:
- `[CHILD_CREATE] Submitting child creation`
- `[CHILD_CREATE] API response`
- `[CHILD_CREATE] Success! Redirecting to dashboard...`

These logs confirm the flow is working correctly.