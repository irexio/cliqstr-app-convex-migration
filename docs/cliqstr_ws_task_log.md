**Document Title: WS Task Log — Requested Fixes & Features**

**Prepared for:** Robyn & Claude/WS  
**Date Started:** August 1, 2025  
**Maintained by:** Sol

---

### 📋 Purpose
This document tracks all requested tasks, fixes, and new features delegated to WS/Claude. Each entry includes status, description, and action notes. Items here may be referenced in the main launch polish checklist but are meant for active tracking and implementation.

---

### ✅ Task 1: Manual Invite Code Entry Flow — `/invite/manual`
**Status:** ✅ Complete (confirmed August 1)
- New route `/invite/manual` accepts codes like `cliq-xxxx`
- Routes based on invite role (adult/parent/child)
- Updated all invite emails with code display and fallback instructions

---

### ✅ Task 2: Fix Avatar Display in Feed
**Status:** ✅ Complete (confirmed August 1)
- Posts and replies now display avatar from `myProfile.image`
- Fallback avatar displays as grey circle when no image is present
- No more empty avatar squares; cliq-level or emoji avatars removed
- Refreshed avatars after profile update appear correctly in feed and replies
- If no profile image, show grey default avatar (never empty square)
- Avatar logic should not pull from cliq-level settings

---

### ✅ Task 3: Redirect After Profile Save
**Status:** ✅ Complete (confirmed August 1)
- `CreateProfileForm` redirects to `/profile/{username}` after creation
- `EditProfileForm` redirects to `/profile/{username}` after update
- Username is extracted from API response with fallback logic
- Users land directly on their updated profile after save

---

### ✅ Task 4: Require Profile Before Posting
**Status:** ✅ Complete (confirmed August 1)
- Users can join and view cliqs without a profile
- Post composer is hidden if `myProfile === null`
- Displays friendly message: “Before you post, please take a moment to set up your profile so your cliqmates know who you are.”
- Includes CTA to `/profile/create`
- After creating a profile, users return to their cliq and can post normally
- Ensures no "Unknown" usernames appear in the feed
- ✅ UPDATE: The message to set up a profile should **only show if `myProfile === null`** — do not show to users who already have a profile. Confirmed display bug needs patching.

---

### ✅ Task 5: Show 'My Cliqs' in Header Across All Pages
**Status:** ✅ Complete (confirmed August 2)
- 'My Cliqs' link was not showing due to over-restrictive logic
- Fixed by reverting both `DesktopNav` and `MobileMenu` to show link for ALL logged-in users (not just approved users)
- Now appears on all pages for any signed-in user

---

### ✅ Task 6: Session Timeout Improvements — Safety + UX
**Status:** ✅ Complete (confirmed August 2)
- Extended session timeout from 30 minutes → 1 hour (less friction)
- Reduced revalidation checks from every minute → every 5 minutes
- Preserved child safety rules:
  - Still checks auth every 10 minutes
  - Verifies approval and role changes
  - Keeps tracking logic in place
- Users experience fewer surprise logouts, but APA protections remain fully enforced

---

### ✅ Task 7: Replies Feature in Feed
**Status:** ✅ Complete (confirmed August 1)
- Reply count shown under each post: “💬 X replies”
- Clicking opens reply input and displays all existing replies
- Users can submit replies with avatar shown
- Real-time updates: reply appears instantly on post
- UI: Nested replies shown below post with clear indentation
- Full TypeScript safety + error handling
- Cancel button closes the reply box
- ✅ UPDATE: Add a clearer "Reply" button label next to or below the reply icon, especially on mobile. Current icon-only interaction is ambiguous.

---

### ✅ Task 8: Improve Spacing/Layout on `/profile/edit`
**Status:** ✅ Complete (confirmed August 2)
- Added p-4 padding to modal backdrop
- Increased content padding from px-6 pb-6 to px-8 pb-8
- Increased button section spacing from pt-4 to pt-6
- Improved mobile layout for better breathing room and spacing

---

### ✅ Task 9: Fix Profile Setup Prompt Display Logic
**Status:** ✅ Complete (confirmed August 2)
- Fixed conditional logic to properly detect `myProfile && myProfile.username`
- Users with valid profiles no longer see the setup prompt
- Only users with no profile or incomplete profiles are shown the message

---

### ✅ Task 10: Improve Reply Visibility and Post Container Layout
**Status:** ✅ Complete (confirmed August 2)
- Added post container wrapper with `rounded-lg border border-gray-200 bg-white shadow-sm p-4 mb-6`
- Replies nested inside using `pl-4 border-l border-gray-200 mt-4`
- Updated reply interaction button with smart labeling:
  - 0 replies: "💬 Reply"
  - 1 reply: "💬 1 reply"
  - >1 replies: "💬 X replies"
- Right-aligned reply button using `flex justify-end`
- Ensured accessibility: 44x44px tap size and `aria-label="Reply to post"`

---

### ✅ Task 11: Activity Notifications System
**Status:** ✅ Complete (confirmed August 2)
- Red badges added to cliq cards: show "X new" posts/replies since last visit
- Automatic visit tracking on cliq enter
- New backend: `/api/cliqs/activity-counts` and `/api/cliqs/[id]/visit`
- Built to scale: future cliq-wide notifications or per-post updates

---

### ✅ Additional Enhancements (August 2)
- ✅ Password UX: Added show/hide toggles to all password input fields
- ✅ Mobile Modal Fixes: Fixed viewport issues and improved modal behavior on mobile screens

---

### ✅ Database Review — August 2 Reset Confirmation
- ✅ Prisma schema confirmed safe
- ✅ No damage to APA models: `Account`, `MyProfile`, `ChildSettings`, `ParentLink`
- ✅ User, Post, Invite, and Membership relations remain intact
- ✅ No system-level data loss (just testing users)

---

Let Sol know when a new WS instruction is ready to be added.

