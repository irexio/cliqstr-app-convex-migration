# 📘 FLOW.md — Core Flows for APA-Verified Access

_Last updated: August 7, 2025_

This document defines how users move through the Cliqstr system under the rules of APA (Aiden's Power Auth). All flows are confirmed either in production or test mode.

---

## 🧒 CHILD ENTRY FLOWS

### 1. Direct Sign-Up

- User enters birthdate < 18 → triggers child path
- Required to provide parent/guardian email
- API: `POST /api/parent-approval/request`
- Invite sent to parent
- Parent creates account or logs in → completes approval via `/parents/hq`
- Parent sets:
  - Username
  - Password
  - Permissions
  - Red Alert acknowledgment + silent monitoring
- API: `POST /api/parent-approval/complete`
- Child account becomes active
- API: `POST /api/parent/child-credentials/update`

### 2. Invite-Based (Adult Invites a Child)

- Adult creates child invite → enters parent’s email
- Email goes to parent with link to `/invite/accept?code=xxx`
- Redirects to `/invite/parent` → checks for logged-in state
  - If logged out → `/invite/parent/signup?inviteCode=xxx`
  - If free adult → upgrade to parent via `/api/auth/upgrade-to-parent`
- All paths redirect to `/parents/hq?inviteCode=xxx`
- Parent sees `ChildInviteApprovalFlow`
- Approval process same as above
- `invite.used = true` after full setup

---

## 👨‍👩‍👧 PARENT HQ FLOW

### Entry:
- `/parents/hq` → requires session + `role === 'Parent'`
- If `inviteCode` is present → shows approval screen
- Else → loads `ParentDashboard`

### Child Invite Approval:
- Invite data loaded (child name, cliq, inviter)
- Parent sets:
  - Username/password
  - Permissions
  - Monitoring preferences
  - Red Alert acknowledgment
- On save:
  - `ParentLink` created
  - `ChildSettings` upserted
  - `invite.used = true`
  - `ParentAuditLog` updated
  - Email sent to child (optional future)

---

## 👨 ADULT FLOWS

### 1. Direct Sign-Up
- `/sign-up` → email, password, birthdate ≥ 18
- Redirect to `/choose-plan`
- Select plan → `/my-cliqs-dashboard`

### 2. Invite-Based (Adult → Adult)
- Click email → `/invite/accept?code=xxx`
- Redirect to `/sign-up`
- After login/signup → added to cliq
- `invite.used = true`

---

## 🔄 SESSION + INVITE PRESERVATION

### Previous Issue:
- Session-ping logic was routing logged-in users to `/my-cliqs` before invite could load

### Fixed Logic:
- InviteCode is now preserved through all redirects
- Logged-in users with invite codes are properly routed to `/parents/hq?inviteCode=xxx`

---

## 🚫 BLOCKED PATHS (APA ENFORCEMENT)

| Role | Scenario | Result |
|------|----------|--------|
| Child | Tries to approve an invite | ❌ Blocked with error |
| Adult | Bypasses invite and lands on `/parents/hq` with no inviteCode | ✅ Sees child dashboard only |
| Expired Invite | Any | ❌ Error shown, no entry |

---

## ✅ FINAL APPROVAL CRITERIA

A child account becomes active only when:
- Parent has an account (or creates one)
- Parent completes full approval UI
- `ParentLink` is created
- `ChildSettings` is saved
- Red Alert toggle is acknowledged
- Credentials are created by parent
- `invite.used = true`

---

> This doc must be updated by Codex or contributors when any approval logic, signup flow, or invite handling is modified.