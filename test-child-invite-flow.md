# Child Invite Flow Test Script

## Summary of Fixes Applied

The child invite flow was freezing at step 1 (parent signup) because after successful signup, the page wasn't properly refreshing to show the next step (child creation form). 

### Changes Made:

1. **ParentsHQWithSignup.tsx**:
   - Changed `router.refresh()` to `window.location.href = '/parents/hq#create-child'` after parent signup
   - This ensures the session is properly picked up and the page reloads to show step 2
   - Applied same fix to upgrade-to-parent flow

2. **ChildCreateModal.tsx**: 
   - Changed `router.refresh()` to `window.location.href = '/parents/hq'` after child creation
   - Added console logging for debugging
   - Added 500ms delay before redirect to ensure DB writes complete

3. **Permissions flow**:
   - Changed refresh to full redirect for consistency

## Test Steps

1. **As Cliq Owner**: Send invite to a child
   - The invite should generate a link like `/invite/[token]`
   
2. **Parent clicks invite link**:
   - Should be redirected to `/parents/hq#create-child`
   - Step 1: Parent signup form should appear (if not already signed in)
   
3. **Parent completes signup**:
   - Fill in: First Name, Last Name, Email, Birthdate, Password
   - Select plan (test/invited-free)
   - Click "Create account"
   - **EXPECTED**: Page should reload and show Step 2 (child creation form)
   
4. **Parent creates child account**:
   - Child's name should be pre-filled from invite
   - Enter username and password for child
   - Click "Create child account"
   - **EXPECTED**: Redirect to Parents HQ dashboard showing the child

## What Was Broken

The issue was that `router.refresh()` wasn't properly updating the component state after the parent signup created a new session. The server-side props in `/parents/hq/page.tsx` weren't being re-evaluated, so it kept showing the signup form even though the parent was now authenticated.

Using `window.location.href` forces a full page reload, ensuring:
1. The new session cookie is read
2. Server components re-evaluate 
3. The correct step is shown based on the new state

## Security Notes

The flow maintains all security requirements:
- Parent must create account first
- Parent sets all permissions for child
- Invite is only consumed after child account is fully created
- Child is properly linked to parent via ParentLink table