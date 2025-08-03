# CURRENT-APP-FLOWS.md

> ✅ Verified: August 3, 2025
> This file tracks how the app behaves *as implemented*, not just how it was designed. It is updated after QA sessions and deployment reviews.

---

## 🔐 SIGN-UP FLOW

### Child (Direct Signup)

* Must enter parent email
* Parent receives approval request
* Parent approval triggers account creation, permissions, username/password setup
* Child cannot access Cliqs until `/parents/hq` approval is completed
* `inviteRequiresApproval` toggle = `true` by default (APA-enforced)

### Adult (Direct Signup)

* Enters email, password, and birthdate
* Gets access to `/choose-plan` → trial or paid plan required
* No parental controls applied
* Role = `Adult`, automatically verified

---

## 📨 INVITE FLOW

### Child Invite (To Parent)

* Parent receives invite email → routed to `/invite/parent`
* On approval → redirected to `/parents/hq?inviteCode=xxx`
* `ChildInviteApprovalFlow` renders approval interface
* Parent sets:

  * Red Alert acknowledgment ✅
  * Silent monitoring toggle ✅
  * Permissions (e.g. `canSendInvites`, `canPostImages`)
  * Username & password for child
* Backend creates:

  * `ParentLink`
  * `ChildSettings` (with `upsert`)
  * Logs `accepted_red_alert` in `ParentAuditLog`
  * `invite.used = true`
  * Auto-login session for parent

### Adult Invite

* Invite email contains `/invite/accept?code=...`
* On click, routed to signup/login
* Adult account created
* Role = `Adult`, no further approval required
* `invite.used = true` set post-signup

---

## 📋 PARENTS HQ

* Route: `/parents/hq`
* Requires session + role = `Parent`
* Renders `ParentsHQContent.tsx`

  * If `?inviteCode=...` exists → shows `ChildInviteApprovalFlow`
  * Else → shows `ParentDashboard`

### Current Capabilities:

* Red Alert opt-in tracking ✅
* Silent monitoring toggle ✅
* Per-child permission settings ✅
* Add/Edit child username/password (invite-based)

---

## 🧠 ROLES & ACCESS

| Role   | Can Create Cliqs      | Can Invite Others        | Requires Approval |
| ------ | --------------------- | ------------------------ | ----------------- |
| Child  | ❌ (unless toggled on) | ❌ (unless toggled on)    | ✅ Always          |
| Teen   | ✅ Private by default  | ✅ (with parent approval) | ✅ Under 18        |
| Adult  | ✅ All types           | ✅                        | ❌                 |
| Parent | ✅ All types           | ✅                        | ❌                 |

---

## 🛑 BLOCKERS (REMOVED OR FIXED)

| Issue                                    | Status                                                            |
| ---------------------------------------- | ----------------------------------------------------------------- |
| Invite prematurely marked used           | ✅ Fixed — now waits for full approval                             |
| `/invite/parent` routing skipped         | ✅ Fixed — enforced redirect with `inviteType=child`               |
| Missing `ChildSettings` logic            | ✅ Fixed — now uses `upsert` on approval                           |
| Red Alert agreement not logged           | ✅ Fixed — audit log entry created                                 |
| Multiple approval components conflicting | ✅ Fixed — cleaned and unified under `ChildInviteApprovalFlow.tsx` |

---

## 🚧 IN-PROGRESS / FUTURE PLANNING

* Add multi-child support to `ParentDashboard`
* Parent pre-approval of invite recipients
* Child cliq creation requests routed via Parents HQ
* Age gating: show reason for join restriction in UI
* Add `decline` handling and tracking for child invites
* Show pending approval status in parent dashboard

---
