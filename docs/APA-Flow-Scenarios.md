# 👨‍👩‍👧 APA-Flow-Scenarios.md

This file documents all key flows for APA-safe onboarding, invite logic, and current testing-mode overrides for Cliqstr.

________________________________________

## 🔐 APA Sign-Up & Invite Flow Matrix

| Scenario | Trigger/Action | System Response |
|----------|----------------|-----------------|
| **Adult - Sign Up** | Signs up directly | - role: adult<br>• Enter First Name & Last Name<br>• Enter Birthdate<br>• Auto sign-in after registration<br>• Redirect to `/choose-plan`<br>• Plan page – Only one plan (Test Plan), no Stripe integration<br>• After plan selection, redirect to `/email-confirmation` ✅ |
| **Child - Sign Up** | Signs up directly (rare, uninvited) | - role: child<br>• Prompt for parent email<br>• Resend email sent to parent<br>• Show success message briefly<br>• Redirect to `/awaiting-approval` ✅ |
| **Adult - Invite** | Invites someone from dashboard | - Radio select: Invite Adult or Invite Child<br>• If Invite Child: prompt for child name & parent email<br>• Sends Resend email to **parent approval screen** (`/parent-approval?inviteCode=...&childId=...`) — not `/awaiting-approval` |
| **Child - Invite** | (Only if approved to invite) | - `ChildSettings.canSendInvites = true`<br>• `inviteRequiresApproval` determines routing:<br>&nbsp;&nbsp;&nbsp;&nbsp;o If true: invite is pending until parent approves<br>&nbsp;&nbsp;&nbsp;&nbsp;o If false: invite is sent immediately |

________________________________________

## 👨‍👩‍👧 Child Sign-Up Flow (Direct or via Invite)

**1. Child fills out:**
• First name, last name<br>• Birthdate

**2. System:**
• Determines age < 18 → role: child<br>• Prompts for parent email<br>• Sends Resend email to parent with link to welcome page

**3. Child sees:**
• `/awaiting-approval`

**4. Parent clicks approval link:**
• Taken to `/parent-approval?inviteCode=...&childId=...`

**5. Parent sees:**
• Welcome screen<br>• Explanation of Cliqstr safety<br>• Child preview info (first name, last name, age)<br>• Form: enter parent email and create password<br>• Consent information and test plan details ✅

**6. On submit:**
• `Account.isApproved = true`<br>• `ParentLink` is created<br>• Parent account created if needed<br>• Test plan applied automatically<br>• Parent redirected to `/parents-hq` ✅

**7. In Parents HQ:**
• Parent **must** set up username and password for child<br>• Parent is instructed to either help child sign in or share credentials<br>• This is a critical APA compliance step for family account management<br>• Prepares for future family plan support (2 adults, up to 5 children)

________________________________________

## 👀 Invite Flow Breakdown (APA-Safe)

### **Adult → Child Invite**
• Invite modal shows: Invite Adult / Invite Child (radio buttons)<br>• If Invite Child:<br>&nbsp;&nbsp;&nbsp;&nbsp;o Collect:<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▪ Child first name and last name<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▪ Parent email (**trusted adult contact** — must be the legal guardian who approves the invite)<br>&nbsp;&nbsp;&nbsp;&nbsp;o Send Resend email to parent:
  "Your child [childName] has been invited by [inviterName] to join their cliq on Cliqstr."<br>• Invite stored with:<br>&nbsp;&nbsp;&nbsp;&nbsp;▪ `inviteType = child`<br>&nbsp;&nbsp;&nbsp;&nbsp;▪ `friendFirstName` & `lastName`<br>&nbsp;&nbsp;&nbsp;&nbsp;▪ `trustedAdultContact`<br>&nbsp;&nbsp;&nbsp;&nbsp;▪ `inviteNote` (optional)<br>• An Adult to child invite must always be approved by an adult if under age 17

### **Child → Invite Anyone**
• Only allowed if:<br>&nbsp;&nbsp;&nbsp;&nbsp;o `ChildSettings.canSendInvites = true`<br>• Invite requires parent approval if:<br>&nbsp;&nbsp;&nbsp;&nbsp;o `inviteRequiresApproval = true`<br>• If not required:<br>&nbsp;&nbsp;&nbsp;&nbsp;o Invite is sent normally<br>&nbsp;&nbsp;&nbsp;&nbsp;o Email still routed through Resend for safety tracking

________________________________________

## 🚧 Testing-Mode Overrides

• Stripe is disabled (no payment UI shown)<br>• All plans are auto-set to `test` plan<br>• Only one plan option shown on `/choose-plan` page<br>• Adult sign-up flow: Sign-up → Choose-Plan → Email-Confirmation → My-Cliqs-Dashboard<br>• Child sign-up flow: Sign-up → Awaiting-Approval → (Parent approval) → Parents-HQ<br>• Parent approval flow: Parent-Approval → Parents-HQ → Set Child Username/Password<br>• **Important**: Parents MUST set up username and password for their children in Parents-HQ

________________________________________

## ✅ Implemented Changes

• Updated `/sign-up-form.tsx` to redirect adults to `/choose-plan` after sign-up<br>• Updated `/sign-up-form.tsx` to redirect children to `/awaiting-approval` after parent email submission<br>• Created `/email-confirmation` page for adults after plan selection<br>• Rewrote `/parent-approval` page as client component with child preview<br>• Created `/api/parent-approval/validate` endpoint to fetch child info<br>• Created `/api/parent-approval/complete` endpoint to finalize approval<br>• Updated `/session-ping` to redirect test plan users to `/email-confirmation`<br>• Ensured `/choose-plan` page only shows Test Plan during testing phase<br>• Disabled Stripe integration in all flows<br>• Added child username/password setup UI in `/parents-hq` page<br>• Created `/api/parent/child-credentials/update` endpoint for parents to set child credentials<br>• Added clear instructions for parents to share credentials with their children

________________________________________

*Updated by Windsurf Assistant, July 21, 2025 💖*
