# 📘 ROUTES.md — Canonical Route & Access Map for Cliqstr

_Last updated: August 7, 2025_

This file provides a **single source of truth** for all frontend and backend routes, grouped by role and function. It reflects **current, enforced logic** in the codebase.

---

## 🌐 PAGE ROUTES (Frontend)

| Route | Description | Role | Notes |
|-------|-------------|------|-------|
| `/` | Public homepage | All | Entry point, APA-safe |
| `/sign-up` | Sign-up form | All | Child/adult branching logic |
| `/sign-in` | Login | All | APA hardened |
| `/choose-plan` | Plan selection | Adult/Parent | Requires verified account |
| `/awaiting-approval` | Await parent approval | Child | Entry via signup flow |
| `/parents/hq` | Parent HQ dashboard | Parent | Renders `ParentDashboard` or `ChildInviteApprovalFlow` |
| `/invite/accept` | Invite code redirect handler | All | Validates invite, then redirects |
| `/invite/parent` | Parent invite landing | Parent | Confirms inviteCode, routes to signup or HQ |
| `/invite/parent/signup` | Dedicated parent signup | Adult | Used in invited child flows |
| `/my-cliqs-dashboard` | Main user dashboard | All | Role-aware view of joined cliqs |
| `/cliqs/create` | Create new cliq | Adult/Parent | Restricted from children unless toggled |
| `/cliqs/[id]` | View cliq | Members | Requires cliq membership |
| `/profile/create` | Create profile | All | Separate from account setup |
| `/profile/[username]` | View profile | Members only | Requires shared cliq + approval |

---

## 🔐 BACKEND ROUTES (API)

| Route | Purpose | Access | Notes |
|-------|---------|--------|-------|
| `/api/sign-up` | Create user account | Public | Handles adult/child branching |
| `/api/sign-in` | Login + session | Public | Secure iron-session-based auth |
| `/api/invite/create` | Create invite | Authenticated | Enforces APA for child logic |
| `/api/validate-invite` | Validate invite | Public | Replaces deprecated `/invites/validate` |
| `/api/parent-approval/request` | Start child approval | Public | Called during child signup |
| `/api/parent-approval/complete` | Finish approval | Parent | Links parent to child, creates `ParentLink` |
| `/api/parent/settings/update` | Save child settings | Parent | Toggles permissions |
| `/api/parent/children` | List children | Parent | Used in ParentDashboard |
| `/api/parent/child-credentials/update` | Set username/password | Parent | Part of invite approval |
| `/api/user/plan` | Save plan choice | Adult/Parent | Sets free or paid tier |
| `/api/cliqs/create` | Create cliq | Adult/Parent | Children require permission |
| `/api/cliqs/feed` | Load cliq feed | Members | Requires membership check |
| `/api/posts/create` | Create post | Members | Enforces expiration & APA safety |
| `/api/profile/create` | Create profile | All | Follows account creation |
| `/api/auth/status` | Check session | All | APA-safe fallback |

---

## ⚠️ DUPLICATE / DEPRECATED ROUTES TO CLEAN UP

| Route | Problem |
|-------|---------|
| `/invite/adult` | Unused or duplicated |
| `/invite/sent` | May be replaced by `/invite/accept` flow |
| `/parents/approval` | Confirm canonical usage vs `/parents/hq` |
| `/parent-approval` | Duplicates approval endpoint — unify naming |

---

## 🛑 RULE ENFORCEMENT CHECKLIST

- All routes **must validate session and role** via `getCurrentUser()`
- Child flows must enforce:
  - Invite must be used once only
  - Parent approval must be complete
  - `ParentLink` and `ChildSettings` must exist
- Invite codes must be:
  - Validated server-side
  - Preserved through all redirects
  - Marked used only after approval (not on click)

---

> Codex and all contributors must update this file when adding, removing, or renaming any routes. This is an APA-mandated doc.

