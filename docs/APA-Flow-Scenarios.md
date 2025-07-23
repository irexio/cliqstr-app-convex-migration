# 👨‍👩‍👧 APA-Flow-Scenarios.md

This file documents all key flows for APA-safe onboarding, invite logic, and current testing-mode overrides for Cliqstr.

---

## 🔐 APA Sign-Up & Invite Flow Matrix

| Scenario            | Trigger/Action                      | System Response                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Adult - Sign Up** | Signs up directly                   | - role: adult<br>• Enter First Name & Last Name<br>• Enter Birthdate<br>• Enter Email<br>• Resend sends confirmation email<br>• User sees confirmation message (please check your email)<br>• Upon clicking Resend link → `User.isVerified = true`<br>• THEN redirected to `/choose-plan`<br>• Plan page – Only one plan (Test Plan), no Stripe integration<br>• After plan selection, redirected to `/my-cliqs-dashboard` ✅ |
| **Child - Sign Up** | Signs up directly (rare, uninvited) | - role: child<br>• Prompt for parent email<br>• Resend email sent to parent<br>• Show success message briefly<br>• Redirect to `/awaiting-approval` ✅                                                                                                                                                                                                                                                                        |
| **Adult - Invite**  | Invites someone from dashboard      | - Radio select: Invite Adult or Invite Child<br>• If Invite Child: prompt for child name & parent email<br>• Sends Resend email to **parent approval screen** (`/parent-approval?inviteCode=...&childId=...`) — not `/awaiting-approval`                                                                                                                                                                                     |
| **Child - Invite**  | (Only if approved to invite)        | - `ChildSettings.canSendInvites = true`<br>• `inviteRequiresApproval` determines routing:<br>    o If true: invite is pending until parent approves<br>    o If false: invite is sent immediately                                                                                                                                                                                                                            |

---

## 👨‍👩‍👧 Child Sign-Up Flow (Direct or via Invite)

**1. Child fills out:**<br>• First name, last name<br>• Birthdate

**2. System:**<br>• Determines age < 18 → role: child<br>• Prompts for parent email<br>• Sends Resend email to parent with link to welcome page

**3. Child sees:**<br>• `/awaiting-approval`

**4. Parent clicks approval link:**<br>• Taken to `/parent-approval?inviteCode=...&childId=...`

**5. Parent sees:**<br>• Welcome screen<br>• Explanation of Cliqstr safety<br>• Child preview info (first name, last name, age)<br>• Form: enter parent email and create password<br>• Consent information and test plan details ✅

**6. On submit:**<br>• `Account.isApproved = true`<br>• `ParentLink` is created<br>• Parent account created if needed<br>• Test plan applied automatically<br>• Parent redirected to `/parents-hq` ✅

**7. In Parents HQ:**<br>• Parent **must** set up username and password for child<br>• Parent is instructed to either help child sign in or share credentials<br>• This is a critical APA compliance step for family account management<br>• Prepares for future family plan support (2 adults, up to 5 children)

---

## 👀 Invite Flow Breakdown (APA-Safe)

### **Adult → Child Invite**

• Invite modal shows: Invite Adult / Invite Child (radio buttons)<br>• If Invite Child:<br>    o Collect:<br>        ▪ Child first name and last name<br>        ▪ Parent email (**trusted adult contact** — must be the legal guardian who approves the invite)<br>    o Send Resend email to parent:<br>        "Your child \[childName] has been invited by \[inviterName] to join their cliq on Cliqstr."<br>• Invite stored with:<br>    ▪ `inviteType = child`<br>    ▪ `friendFirstName` & `lastName`<br>    ▪ `trustedAdultContact`<br>    ▪ `inviteNote` (optional)<br>• An Adult to child invite must always be approved by an adult if under age 17

### **Child → Invite Anyone**

• Only allowed if:<br>    o `ChildSettings.canSendInvites = true`<br>• Invite requires parent approval if:<br>    o `inviteRequiresApproval = true`<br>• If not required:<br>    o Invite is sent normally<br>    o Email still routed through Resend for safety tracking

---

## 🚧 Testing-Mode Overrides

• Stripe is disabled (no payment UI shown)<br>• All plans are auto-set to `test` plan<br>• Only one plan option shown on `/choose-plan` page<br>• Adult sign-up flow: Sign-up → Choose-Plan → Email-Confirmation → Verified → My-Cliqs-Dashboard<br>• Child sign-up flow: Sign-up → Awaiting-Approval → (Parent approval) → Parents-HQ<br>• Parent approval flow: Parent-Approval → Parents-HQ → Set Child Username/Password<br>• **Important**: Parents MUST set up username and password for their children in Parents-HQ

---

## ✅ Implemented Changes

• Updated `/sign-up-form.tsx` to redirect adults to `/choose-plan` after sign-up<br>• Updated `/sign-up-form.tsx` to redirect children to `/awaiting-approval` after parent email submission<br>• Created `/email-confirmation` page for adults after plan selection<br>• Rewrote `/parent-approval` page as client component with child preview<br>• Created `/api/parent-approval/validate` endpoint to fetch child info<br>• Created `/api/parent-approval/complete` endpoint to finalize approval<br>• Updated `/session-ping` to redirect test plan users to `/email-confirmation`<br>• Ensured `/choose-plan` page only shows Test Plan during testing phase<br>• Disabled Stripe integration in all flows<br>• Added child username/password setup UI in `/parents-hq` page<br>• Created `/api/parent/child-credentials/update` endpoint for parents to set child credentials<br>• Added clear instructions for parents to share credentials with their children<br>• Introduced `User.isVerified = true` to confirm email ownership for adult sign-up<br>• Invite flows and parent approvals implicitly verify invitee emails and mark `account.isApproved = true` when complete

---

*Updated by Windsurf Assistant, July 23, 2025 💖*
