# 📘 CLAUDE.md — Project Instructions for Claude Code

This document provides project-level guidance to Claude Code for reviewing, editing, or suggesting changes in the Cliqstr codebase.

---
Please follow these rules for each session:
1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the [DOCS/TODO.md] file with a summary of the changes you made and any other relevant information.

## 🧠 Project Summary

Cliqstr is a private, family-first social platform designed to enable safe group sharing for children, parents, grandparents, and trusted adults.

### Mission:

Create an APA-safe (Aiden's Power Auth) space that prioritizes security, age-based controls, and intentional friction to protect children online.

---

## 🔐 Key Principles for Claude to Follow

* **Session-based authentication only** — No token-based auth; all auth is session-secured with custom middleware
* **Role-based flows**:

  * `role: adult`, `role: child` must trigger different onboarding and UI logic
  * Children never self-approve invites or actions without parent controls
* **Parent approval is mandatory** for:

  * Direct child sign-up
  * Any invite sent to a child
* **Invite logic must respect APA rules**:

  * `inviteType = child` requires parent email (`trustedAdultContact`) and must trigger approval screen, **not auto-join**
* **ChildSettings** (defined in `/parents-hq`) determines:

  * Whether child can send invites (`canSendInvites`)
  * Whether those invites require approval (`inviteRequiresApproval`)
  * Whether the child can create public cliqs or access certain features
* **No global visibility** — Users only see members of cliqs they belong to
* **Red Alerts**:

  * Must include a confirmation pop-up before sending
  * Remain a last-resort safety system and must not be modified without approval
* **File upload is currently not working** and must be restored before full cliq testing (UploadThing integration broken or incomplete)
* **`/my-cliqs-dashboard`** page should be validated — there are signs a new, potentially conflicting dashboard may have been added by mistake
* **Email Verification vs. Approval**:

  * `User.isVerified = true` must be set when:

    * An adult clicks the Resend confirmation link during sign-up
    * A parent clicks the Resend link to approve their child
    * An invited adult or parent clicks the Resend invite link
  * `Account.isApproved = true` is only set when:

    * An adult selects a plan after email confirmation
    * A parent approves a child sign-up and configures their account
    * A user completes invite acceptance and plan setup
  * ⚠️ Claude must distinguish between verification (`isVerified`) and approval (`isApproved`) — do not conflate them



---

## 🧩 Known Flow Issues To Investigate

Claude should prioritize resolving and verifying these known broken flows:

### 🚧 Sign-Up Flow Issues

* ❗ Adult sign-up:

  * Flow:

    * Sign-up modal collects: First Name, Last Name, Birthdate, Email
    * Tells user to check email
    * Resend sends confirmation email
    * User clicks confirmation link → redirected to Choose Plan (test plan only)
    * Plan selected (no Stripe)
    * Confirm plan → redirect to `/my-cliqs-dashboard`
  * Flow must use `account.isApproved`
  * Do not bypass email confirmation even during test mode
  * Set `user.isVerified = true` upon successful Resend confirmation click

* ✅ Confirmation is **only required for adult direct sign-up.**

* 🔔 For all **other flows** (child sign-up, adult-to-child invite, child-to-child invite, etc.):

  * Parent or invitee receives and acts on an invite, which serves as **implicit confirmation**
  * The system **must flag the user as verified upon invite acceptance or plan selection**
  * ✅ Claude must update `account.isApproved = true` **at the moment of invite acceptance or parent approval** in all these flows for consistent audit and legal coverage
  * 🔐 This ensures APA and legal compliance even if no explicit email confirmation is triggered

* ❗ Child sign-up must:

  * Show `/awaiting-approval` screen after sign-up
  * Trigger a Resend email to parent
  * Redirect parent from email to `/parent-approval` → then `/parents-hq` after approval and plan setup
  * End with username + password creation for the child

* 🔁 Ensure all approval and verification checks use `Account.isApproved`, not `User.isApproved`

### 🚧 Invite Flow Issues

* ❗ Invite link validation still hangs — validate route `/api/validate-invite` and frontend logic
* ✅ Adult-to-child invite:

  * Requires parent email (`trustedAdultContact`) and must trigger the full approval flow
* ✅ Child invite flow:

  * Allowed only if `ChildSettings.canSendInvites = true`
  * If `inviteRequiresApproval = true`, the invite is held until a parent approves it
  * Otherwise, invite is sent immediately

### 🚧 UI/UX Flow Issues

* User Profile and Cliq Creation Flexibility:
  * 2 should show both - for example: if a user is in the process of setting up a profile but can't find a picture to use. They may want to edit the profile or create a cliq. 
  * #3 Should also include both

---

## 📁 Key Reference Files

Claude should use these for logic alignment:

* `docs/APA-Flow-Scenarios.md` ✅ — Canonical onboarding and invite behavior
* `docs/MODEL-SPECS.md` ✅ — DB model relationships and role/permission structure
* `docs/TOBEADDED.md` ✅ — Upcoming features that may affect logic
* `docs/API-Routes-Flows.md` ✅ — Most up-to-date API and page logic definitions

---

## ❗ Avoid These Mistakes

* ❌ Don't simplify or remove ANY EXISTING steps just to reduce friction IN APA — friction is **intentional** in APA
* ❌ Don't alter `/parent-approval`, `/awaiting-approval`, or `/parents-hq` routes without checking spec
* ❌ Don't auto-approve child accounts or merge flows
* ❌ Don't touch custom auth logic (e.g., crypto, session cookies) without instruction
* ❌ Don't overwrite existing `/my-cliqs-dashboard` logic without first confirming it is not redundant

---

## ✅ Do

* ✅ Ensure that sign-up and invite flows always match `APA-Flow-Scenarios.md`
* ✅ Confirm adult email verification gating and Resend behavior
* ✅ Suggest fixes only if they do **not** violate APA rules
* ✅ Always explain why a suggestion was made
* ✅ Scan files in context of security and role protection
* ✅ Respect `CLAUDE.md` as source-of-truth context for all logic updates

---

## 👩‍👧 Example Prompts Claude Should Support

* "Review `/api/invite/validate.ts` and confirm invite approval flow matches `APA-Flow-Scenarios.md`"
* "Does `/api/sign-up/route.ts` properly block child access without parent setup?"
* "Scan for any unsafe direct access to child routes"
* "Fix broken invite link validation and route correctly to child sign-up or parent approval logic"
* "Check that `/parents-hq` applies child permissions correctly per parent settings"
* "Ensure that the `/my-cliqs-dashboard` view is not overwritten or misaligned with previously working logic"

---

*Last updated: July 23, 2025 by Mimi & Assistant*