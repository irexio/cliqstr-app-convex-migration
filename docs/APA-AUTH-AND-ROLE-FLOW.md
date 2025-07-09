# 📘 APA-AUTH-AND-ROLE-FLOW\.md

**Updated:** July 9, 2025
**Author:** Mimi Thomas (Mimi 💜🐧) + Aiden (APA Architect)
**Purpose:** Defines exactly how authentication, role assignment, parent approval, and access gating work across Cliqstr.
**APA Rule:** 🔐 DO NOT CHANGE THIS FLOW WITHOUT WRITTEN APPROVAL FROM AIDEN AND MIMI.

---

### 🔐 1. AUTHENTICATION FLOW — DIRECT SIGN-UP

| Step | Description                                 |
| ---- | ------------------------------------------- |
| 1    | User visits `/sign-up`                      |
| 2    | Enters: `email`, `password`, `birthdate`    |
| 3    | System calculates age from `birthdate`      |
| 4    | Role assigned: `Adult` (18+), `Child` (<18) |
| 5    | ✅ **If Adult:**                             |

* Account is created immediately
* `isApproved = true`
* Redirect to `/profile/create` |
  \| 6 | 🧒 **If Child:**
* Requires `parentEmail`
* Account created with `isApproved = false`
* `InviteRequest` created and stored
* Parent receives email with approval link
* Child shown "Waiting for Approval" screen |
  \| 7 | After parent approves:
* Parent creates child's `username` and `password`
* `isApproved = true`
* Child logs in using parent-generated credentials
* Redirected to `/profile/create` |
  \| 🚫 | **Child never has access to `/account`** — only `/my-cliqs` and `/profile` |

---

### ✉️ 2. AUTHENTICATION FLOW — INVITE-BASED SIGN-UP

| Step | Description                               |
| ---- | ----------------------------------------- |
| 1    | User follows `/sign-up?inviteCode=abc123` |
| 2    | Invite code validated                     |
| 3    | Enters `email`, `password`, `birthdate`   |
| 4    | System calculates age and assigns role    |

#### ➕ **If Adult (18+):**

| Step | Description                                                            |
| ---- | ---------------------------------------------------------------------- |
| 5    | ✅ Stripe credit card identity check **required** — *no charge is made* |
| 6    | After passing check:                                                   |

* User selects a plan (Free or Paid)
* Account created with `isApproved = true` |
  \| 7 | Redirect to `/profile/create` → then `/my-cliqs` |

#### 🧒 **If Child (<18):**

| Step | Description                                                             |
| ---- | ----------------------------------------------------------------------- |
| 5    | Requires `parentEmail`                                                  |
| 6    | Creates `InviteRequest`, holds account in pending state                 |
| 7    | Parent receives link → approves → creates username + password           |
| 8    | `isApproved = true`, child joins cliq and proceeds to `/profile/create` |

---

### 🔓 3. LOGIN FLOW (ALL USERS)

| Step | Description                                           |
| ---- | ----------------------------------------------------- |
| 1    | User visits `/sign-in`                                |
| 2    | Credentials validated (Prisma + bcrypt)               |
| 3    | `isApproved` checked server-side                      |
| 4    | ❌ If `isApproved = false`, redirect to Waiting screen |
| 5    | ✅ If approved, redirect to `/my-cliqs`                |

> 🔐 **NOTE:** No protected page or API can be accessed until `isApproved === true`

---

### 👨‍👧 4. PARENT HQ — MANAGES CHILD ACCOUNTS

| Route    | `/parents-hq`                              |
| -------- | ------------------------------------------ |
| Access   | Verified users with `role = 'parent'` only |
| Features |                                            |

* View all linked child accounts
* Approve new child sign-ups
* Create usernames + passwords
* Set cliq creation/invite permissions
* Monitor activity silently
* Suspend or revoke access |
  \| Notes |
* Parent is **sole controller** of child login and visibility
* Child does **not** know they are being monitored unless toggled
* Child can never reset their own password or change plan |

---

### 🧭 5. MY CLIQS DASHBOARD

| Route   | `/my-cliqs`                                         |
| ------- | --------------------------------------------------- |
| Access  | Only visible to `isApproved = true` users           |
| Content | Shows joined, created, or invited cliqs             |
| Actions | View → `/cliqs/[id]`, Invite → `/cliqs/[id]/invite` |

> ⚠️ **Children can’t create public cliqs or send invites unless toggled ON by parent in Parents HQ.**

---

### 👤 6. PROFILE SETUP

\| Route | `/profile/create` |
\| Trigger | After sign-up/login if profile incomplete |
\| Fields | `username`, `avatar`, `bannerImage`, `bio` (optional) |
\| Rules |

* Unique username required
* Children may be restricted from custom avatars or bios by parent settings
* Moderation rules apply post-launch |
  \| Redirect | To `/my-cliqs` after profile creation |

> 🧠 **Optional age tag display based on birthdate:**

* `Kid`: 8–11
* `Tween`: 10–12 *(informational only)*
* `Teen`: 13–17
* `Adult`: 18+

> 🔒 These tags are for display only, never used in backend auth. Displayed only if birthdate sharing is toggled on by the user.

---

### 🔒 7. ACCOUNT VS PROFILE — APA SEPARATION

| Role       | `/account` Access | Password Control           | Username Control       |
| ---------- | ----------------- | -------------------------- | ---------------------- |
| **Adult**  | ✅ Yes             | Self-managed               | Self-managed           |
| **Parent** | ✅ Yes             | Self + all linked children | Self + children        |
| **Child**  | ❌ No              | Created by parent only     | Created by parent only |

| Type    | `/account/page.tsx`                   | `/profile/[handle]/page.tsx`                                 |
| ------- | ------------------------------------- | ------------------------------------------------------------ |
| Access  | Owner only                            | Mutual cliq members only                                     |
| Content | Billing, plan, email, role, HQ access | Social: username, about, avatar, birthdate (optional toggle) |

---

### ❗ FINAL WARNING

> ⚠️ **DO NOT** modify this logic or any connected auth/role/profile/invite flow without **written approval** from both Aiden and Mimi.
>
> APA enforces:
>
> * Full parent control of minors
> * No unverified access to protected routes
> * Server-side auth only (no client-side role assumptions)
> * Strict separation of admin and social logic
