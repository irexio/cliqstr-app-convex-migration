# APA-Flow-Scenarios.md

> ✅ Verified: August 3, 2025
> This doc defines every major authentication + invite scenario governed by Aiden's Power Auth (APA) system. This is not a design doc — it describes enforced paths and tested logic.

---

## 🧒 CHILD ENTRY PATHS

### 1. **Direct Sign-Up (Child)**

* Flow:

  * Enters email, password, birthdate
  * Birthdate < 18 triggers child path
  * Required to enter parent email
  * Parent receives email with approval link
  * Parent creates account and approves via `/parents/hq`
  * Username/password created by parent (not child)
  * `invite.used = false` until parent finishes setup

### 2. **Invited by Adult to Join Cliq**

* Flow:

  * Invite is sent to parent email (not child)
  * Parent receives email → `/invite/parent`
  * Routes to `/parents/hq?inviteCode=xxx`
  * `ChildInviteApprovalFlow` shows cliq + inviter info
  * Parent sets permissions + silent monitoring + credentials
  * All data persisted on `Save & Approve`
  * `ParentLink` created
  * `ChildSettings` written
  * `invite.used = true`

---

## 👨‍👩‍👧 PARENT ROLE ENFORCEMENT

* All child approval flows must land in `/parents/hq`
* No child invite can be completed without explicit parent interaction
* Red Alert agreement and silent monitoring toggles must be part of setup
* Parent role (`role = Parent`) is enforced on `/parents/hq`
* Parent audit logs are created for red alert, monitoring, and invite actions

---

## 🧑 ADULT ENTRY PATHS

### 1. **Direct Sign-Up (Adult)**

* Flow:

  * Email, password, birthdate (18+)
  * Gets access to `/choose-plan`
  * No parent involvement required
  * Account is immediately active

### 2. **Invited by Another Adult to Join Cliq**

* Flow:

  * Invite contains link → `/invite/accept?code=xxx`
  * Redirects to login/signup
  * Account is created as `Adult`
  * Invite is marked `used = true`
  * User is added to cliq

---

## 🚧 SCENARIOS TO WATCH (WIP)

* Child → Child invite (must route through Parent HQ)
* Child → Adult invite (parent must approve)
* Duplicate child invite handling (block or merge)
* Ability for parent to manage multiple children from single dashboard
* Admin audit tools to view approval logs and child account history

---

## 🔐 APA FLAGS IN DATABASE

| Field                | Enforced By                                 |
| -------------------- | ------------------------------------------- |
| `Account.role`       | APA (child, adult, parent)                  |
| `Account.isApproved` | APA — required for child access             |
| `User.isVerified`    | Invite or parent approval required          |
| `Invite.used`        | APA — only true after final parent approval |
| `ChildSettings.*`    | Configurable via `/parents/hq` only         |
| `ParentLink`         | Must exist for any child account            |

---

## ✅ TEST MODE BEHAVIOR

* Test mode bypasses Stripe but does NOT bypass parental approval
* All approvals and permissions must still be completed
* Test plans are auto-assigned to approved child and parent accounts

---

## 📌 FINAL NOTE

Every APA-authenticated child must have:

* A parent with verified account
* A ParentLink
* A completed `/parents/hq` flow
* Logged red alert agreement
* Explicit account approval via `Account.isApproved = true`

There are **no fallback paths** that allow children into Cliqs without full APA onboarding.

---
