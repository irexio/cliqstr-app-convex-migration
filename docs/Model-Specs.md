# Cliqstr Living Model Spec

## Overview & Vision

Cliqstr is a private, invite-only social space built for families, kids, and trusted communities. It exists to reimagine social media through a lens of joy, safety, and deep belonging — without ads, surveillance, or pressure to perform.

Founded on the principle of **APA (Aiden's Power Auth)**, every action on Cliqstr is intentional, verified, and role-aware. Cliqstr is not just a safer alternative — it is a fundamentally different digital culture, designed to foster:

- Parental trust and involvement without overreach
- Child empowerment within clearly defined, protective boundaries
- Intergenerational joy through cliqs built around shared purpose, play, and care
- Privacy-first design that expires content, limits exposure, and celebrates presence over performance

This spec outlines how Cliqstr works — not just as software, but as a living, ethical system. It exists to guide developers, testers, designers, and advisors in staying true to that founding purpose as the platform evolves.

---

## USER ROLES

| Role      | Description |
|-----------|-------------|
| `child`   | Any user under 18. Requires parental approval. Can join or create cliqs *only* with parent-controlled permissions. |
| `parent`  | Adult user who manages one or more children. Has access to Parents HQ. Can approve invites, monitor activity, and adjust settings. |
| `adult`   | Standard 18+ user not linked to a child. Can create and join public or private cliqs, send invites, and manage their own plans. |
| `admin`   | Reserved internal role (e.g., `mimi@cliqstr.com`) with full visibility across the platform for testing and emergency control. |

---

## ENTRY PATHS

### 1. Direct Sign-Up (No Invite)
- Users provide: email, birthdate, password
- Age is calculated client-side and passed server-side
- Branching:
  - `18+` → sent to `/choose-plan`
  - `<18` → parent email required → redirect to `/awaiting-approval`

### 2. Invite-Based Join
- Receives invite via email or SMS
- Opens invite → triggers validation (`/api/invites/validate`)
- Flow:
  - If adult → redirect to sign-up → pre-fills cliq → plan selection
  - If child → requires parent approval → same as direct child flow

---

## APA GATE CHECKS

| Route                     | Role Required     | APA Check                                  | Fallback or Redirect |
|--------------------------|-------------------|---------------------------------------------|----------------------|
| `/choose-plan`           | `parent`, `adult` | `account.role` enforced                     | `access-denied`      |
| `/parents/hq`            | `parent`          | Must match child link, can silent monitor   | `access-denied`      |
| `/cliqs/create`          | `adult`, `parent` | Children must have create permission        | Error or deny UI     |
| `/api/invite/create`     | Any               | Children require `canInvite` = true         | Silently blocked     |
| `/api/posts/create`      | All               | Plan limits + post cap enforced             | `403` or soft block  |
| `/profile/[username]`    | Approved members  | Only visible if shared cliq + approved      | `not-authorized`     |

---

## POST + CLIQ LIMITS (Plan-Based)

| Plan          | Max Posts       | Post Expiry | Max Cliqs     |
|---------------|------------------|-------------|---------------|
| Free Trial    | 25               | 90 days     | 1             |
| Premium       | 50               | 90 days     | 5             |
| Group Plan    | 100              | 90 days     | 10            |
| Family Plan   | 25 per member    | 90 days     | 3 per member  |

---

## PARENT HQ POWERS

- Approve child account access
- Enable/disable:
  - Public cliq creation
  - Sending invites
  - Cliq-level visibility
- View:
  - Child posts
  - Invites sent
  - Cliq memberships
- Cannot be seen by child (silent observer)

---

## TEST COVERAGE ROADMAP

- `auth.test.js`
  - Sign up (adult/child)
  - Sign in valid/invalid
  - Session role check

- `invite-code.test.js`
  - Validate invite
  - Invite as child (APA approval required)

- `parent-approval.test.js`
  - Complete parent approval
  - Post-approval child access
  - Parent HQ visibility test

---

## Source of Truth

This document is the canonical reference for Cliqstr's logic, vision, and safety model. All changes to app behavior, role permissions, or APA enforcement must be reflected here.

## Revision Log

| Date       | Author       | Summary                                |
|------------|--------------|----------------------------------------|
| 2025-07-12 | Robyn        | Initial share with team (Vic, Rachel)  |
| 2025-07-13 | Aiden        | Added Overview & Vision section        |
| 2025-07-13 | Aiden        | Added source of truth + revision log   |

## Stakeholder Comments Zone

- [ ] Awaiting feedback from Vic on cliq creation flow clarity
- [ ] Rachel to review age gating and public cliq approval clarity
- [ ] Jordan to explore possible role additions or behavioral toggles

---

