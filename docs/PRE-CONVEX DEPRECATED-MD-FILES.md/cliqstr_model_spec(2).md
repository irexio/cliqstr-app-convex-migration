Cliqstr Living Model Spec

## Overview & Vision

Cliqstr is a private, invite-only social space built for families, kids, and trusted communities. It exists to reimagine social media through a lens of joy, safety, and deep belonging — without ads, surveillance, or pressure to perform.

Founded on the principle of **APA (Aiden's Power Auth)**, every action on Cliqstr is intentional, verified, and role-aware. Cliqstr is not just a safer alternative — it is a fundamentally different digital culture, designed to foster:

- Parental trust and involvement without overreach
- Child empowerment within clearly defined, protective boundaries
- Intergenerational joy through cliqs built around shared purpose, play, and care
- Privacy-first design that expires content, limits exposure, and celebrates presence over performance

This spec outlines how Cliqstr works — not just as software, but as a living, ethical system. It exists to guide developers, testers, designers, and advisors in staying true to that founding purpose as the platform evolves.

> **NOTE TO DEVELOPERS, AI AGENTS, AND ASSISTANTS:**
> This spec is the source of truth. No assumptions, overrides, or framework substitutions are allowed unless explicitly documented here. APA logic must be respected. Any deviation must be discussed and annotated in the Stakeholder Comments Zone below or in the revision log. Your role is to **translate this vision into stable, safe, and joyful reality — not reinterpret it.**

---

## USER ROLES

| Role     | Description                                                                                                                        |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `child`  | Any user under 18. Requires parental approval. Can join or create cliqs *only* with parent-controlled permissions.                 |
| `parent` | Adult user who manages one or more children. Has access to Parents HQ. Can approve invites, monitor activity, and adjust settings. |
| `adult`  | Standard 18+ user not linked to a child. Can create and join public or private cliqs, send invites, and manage their own plans.    |
| `admin`  | Reserved internal role (e.g., `mimi@cliqstr.com`) with full visibility across the platform for testing and emergency control.      |

---

## ENTRY PATHS

### Manual Invite Code Entry

- Invite codes are submitted through a dedicated field
- Invite codes are validated via `/api/invites/validate`
- Does **not bypass APA**:
  - Children must submit birthdate and receive parent approval
  - Adults are sent to `/choose-plan`
  - Invite is still linked to inviter for audit

### SMS Invite Logic

- Sent via secure channels
- Includes unique token linked to cliq
- Validated via `/api/invites/validate`
- Children must still complete full APA steps
- Adults go to `/sign-up` → `/choose-plan`

### 1. Direct Sign-Up (No Invite)

- Inputs: email, birthdate, password
- Client calculates age
- Branching:
  - Adult (18+): redirected to `/choose-plan`
  - Child (<18): parent email required → `/awaiting-approval`

### 2. Invite-Based Join

- Receives invite via email or SMS
- Flow:
  - Invite opens to `/invite/accept?code=xxxxx`
  - Invite is validated
  - If adult → `/invite/parent/signup?inviteCode=xxxxx`
  - If child → redirects parent to `/verify-parent` or auto-upgrades existing adults to parent
  - All roads lead to `/parents/hq?inviteCode=xxxxx` for child setup

---

## STRIPE SETUP (TEMPORARY)

- Currently, Stripe is integrated in **test mode only**
- Test card numbers are accepted but no charges are processed
- Used to simulate:
  - Identity verification for parental consent (no billing)
  - Upgrade path for adults selecting paid plans (Premium, Group, etc.)
- No real funds are transferred or stored
- Cliqstr is currently using a **free temporary plan** during test flows
- Stripe cannot go live until final business bank account details are finalized
- Once CLIQSTR goes live, Stripe will be upgraded to **live mode** and integrated with the verified business bank account (US Bank)
- All Stripe usage respects APA boundaries (no paywall for invited children, no hidden upgrades)

---

## APA GATE CHECKS

| Route                 | Role Required     | APA Check                                 | Fallback or Redirect |
| --------------------- | ----------------- | ----------------------------------------- | -------------------- |
| `/choose-plan`        | `parent`, `adult` | `account.role` enforced                   | `access-denied`      |
| `/parents/hq`         | `parent`          | Must match child link, can silent monitor | `access-denied`      |
| `/cliqs/create`       | `adult`, `parent` | Children must have create permission      | Error or deny UI     |
| `/api/invite/create`  | Any               | Children require `canInvite` = true       | Silently blocked     |
| `/api/posts/create`   | All               | Plan limits + post cap enforced           | `403` or soft block  |
| `/profile/[username]` | Approved members  | Only visible if shared cliq + approved    | `not-authorized`     |

---

## CURRENT ISSUES & CODING NOTES

- ❌ **Invite Flow Not Working Reliably:**
  - Clicking on email links sometimes triggers an "expired invite" error or redirects logged-in users directly to `/my-cliqs`
  - Issue likely stems from early session check or database timeout (e.g. Neon cold start)
  - Invite validation logic must be executed **before** checking session state or redirecting

- ⚠️ **Stripe is in test mode only:**
  - Cannot be used for real payments or identity validation
  - All flows relying on Stripe are currently non-functional in production without a verified business account

- 🔁 **Multiple Versions of Parent HQ Components Exist:**
  - Potential duplication of `ParentsHQContent`, `ParentDashboard`, `ChildInviteApprovalFlow`
  - Route and file cleanup is needed to remove legacy or shadowed versions

- 🧪 **Recommended Debug Workflow for Codex:**
  - Test using a known `inviteCode`
  - Log invite status before session redirect logic
  - Verify routing consistency for all roles:
    - New parent (not signed in)
    - Existing adult (free or paid)
    - Existing parent
    - Child (must be blocked from approving)
  - Confirm whether invite context (`inviteCode`) is preserved all the way into `/parents/hq`

- 🔍 **Codex Note:**
  - WS reports that session-ping logic has been updated to preserve inviteCode and route users correctly into Parent HQ, bypassing the old `/my-cliqs` redirect. However, live tests are still failing under certain conditions (logged-in state, Neon DB idle, cold starts).
  - Please double-check actual flow behavior against claims.
  - Flows may work under certain timing conditions but fail under others (e.g. Neon waking, role not upgraded fast enough, expired session).

Codex collaborators: Please sync with this spec before implementing any major changes to routing, auth, or Stripe. This version reflects all current issues known to the founding team.

---

... (rest of the document remains unchanged)

