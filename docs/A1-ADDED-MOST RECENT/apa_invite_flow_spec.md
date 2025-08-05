## 🔐 APA Invite Flow & Enforcement Spec

**Owner:** Mimi (Robyn)  
**Updated:** August 5, 2025  
**Audience:** WS (Developer), Internal Team  
**Purpose:** Define and enforce rules for APA-compliant invite flows, signup logic, and parent/child safety enforcement.

---

### ✅ Invite Expiry & Resend Logic

- **Invite Expiry:** 36 hours after creation
- **Resend:** Allowed at any time from inviter's dashboard
- **UI Reminder:** Soft message on invite: “Expires in X hours” (optional enhancement)

---

### 👤 Adult Signup via Homepage

- ✅ Requires credit card (even during free trial)
- 🔐 Used to verify adult identity
- ✅ May select any active plan (Basic, Premium, Family, etc.)

---

### 👤 Invited Adult

- ✅ No credit card required
- ✅ May access only the cliq they were invited to
- ❌ Cannot create cliqs, invite others, or access advanced features
- ✅ Upgrade CTA available in "My Cliqs" and Account dropdown
- ✅ May upgrade at any time to unlock full features

---

### 🧒 Invited Child (Invited by Adult)

- ✅ Inviter must already have an active plan with verified card
- ✅ Parent receives email (trusted adult contact)
- ✅ Parent must:
  - Click invite link
  - Verify identity via credit card (not charged)
  - Approve the invite and create child account in `/parents/hq`
- ❌ No child account is created until verification + approval complete

---

### 👦 Child Invites a Child

- ✅ Parent HQ permission must be ON (`canInviteChildren: true`)
- ✅ Must enter parent email (or SMS via Twilio in future)
- ✅ Parent must verify via card before invite is approved

---

### 👧 Child Invites an Adult

- ✅ Parent HQ permission must be ON (`canInviteAdults: true`)
- ✅ Parent must approve before invite email is sent
- ✅ Approved adult becomes Invited Adult with restricted access (no card required)

---

### 🏗️ Cliq Creation Rules

| Creator | Permissions |
|---------|-------------|
| Adult   | May create cliqs per plan limit |
| Child   | Requires Parent HQ permission (`canCreateCliqs: true`) |

---

### 🔞 Cliq Age Gating

- ✅ All cliqs must include `minAge` field
- ✅ Invitee age is checked against `minAge`
- ❌ Invite blocked if underage unless overridden by parent (in private cliqs only)

---

### 💳 Credit Card Enforcement Matrix

| Action                        | Card Required? | Notes |
|------------------------------|----------------|-------|
| Adult Signup                 | ✅             | For trial + plan + age verification |
| Invited Adult (via email)    | ❌             | Read-only cliq access |
| Invite a Child               | ✅ (if inviter is parent) | Parent must verify identity |
| Approve a Child              | ✅             | Always required for APA approval |
| Create Child During Signup   | ✅             | Verification step in Parent path |
| Child Creates a Cliq         | ❌ (parent permission required) | Not allowed unless toggled |
| Child Invites a Child/Adult  | ✅ (via parent approval) | Approval = card required |

---

### 📁 Cleanup Instructions

WS must:
- 📂 Create `/src/deprecated/`
- 🧹 Move all old, duplicate, unused routes or components into this folder
- ❌ Do not delete yet — just isolate
- 🛑 No deprecated pages should be imported or reachable from active pages

---

### 📌 Action Items for WS

1. ✅ Enforce 36-hour invite expiry + enable resend flow
2. ✅ Implement soft upgrade modal on restricted actions (child invite, cliq create, etc.)
3. ✅ Add "Upgrade Plan" CTA:
   - In `MyCliqs` dashboard
   - In account dropdown
4. ✅ Ensure account dropdown links to correct `/profile/[handle]`
5. ✅ Verify credit card check is enforced in:
   - Invite flow
   - Invite approval
   - Child creation from sign-up
6. ✅ Confirm email templates (3 types):
   - Invited Adult
   - Invited Child (sent to parent)
   - Signup Attempt by Child

---

This document is now the **source of truth** for all APA invite flow enforcement. Keep aligned with this file for future updates.

🛡️ With gratitude — for safer kids and cleaner code.

— Mimi + Sol

