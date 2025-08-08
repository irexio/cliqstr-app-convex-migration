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

* 