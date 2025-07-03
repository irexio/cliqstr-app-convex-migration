# 📘 Cliqstr Page Architecture & Invite Flow

_Last updated: 2025-07-02 — Revised with feed redesign and feature panel styling 2025-07-02_

This document explains the structure, purpose, and route flow for the **My Cliqs Dashboard**, **Cliq Page**, and **Invite Flow** within Cliqstr.

---

## 🧩 `My Cliqs` Page (Dashboard)

**Route:** `/my-cliqs`

### 🔹 Purpose
This is the main dashboard where users:
- View all Cliqs they have created, joined, or been invited to
- Access core actions like: `View`, `Invite`, and `Members`

### 🔹 Layout Details
Each Cliq card includes:
- 📸 Cliq cover image (specific to the cliq, not the profile)
- 🧾 Name + Description
- 🔘 Buttons:
  - `View`: goes to `/cliqs/[id]`
  - `Members`: goes to `/cliqs/[id]/members`
  - `Invite`: goes to `/cliqs/[id]/invite`

Cards now use the shared `CliqCard.tsx` component, which inherits from `BaseCard.tsx` for a consistent vertical layout and APA-hardened styling.

> ✨ Users can click into any cliq they belong to or were invited to (with permissions).

---

## 🧩 `Cliq Page` (Feed + Tools)

**Route:** `/cliqs/[id]`

### 🔹 Purpose
Dedicated page for a single cliq. Displays:
- Cliq profile info (name, description, banner image)
- **Black + white feed layout** (image/text posts in vertical layout)
- 📱 `FeaturePanel`: a grid of safety and community tools
- 🔘 Members + Invite buttons
- (Future) Chat bubbles, smart tools, and gamified features

### 🔹 Layout Components
- ✅ `CliqProfileContent`: header info (cliq name, cover, description)
- ✅ `FeaturePanel`: black-and-white tool tiles
  - `RedAlert`, `HomeworkHelp`, `Calendar`, `Games`
  - APA-aware, icon-based, user-contextual
- ✅ `CliqFeed`: vertically stacked post cards (uses `PostCard.tsx`)
- ✅ `PostCard`: built on `BaseCard`, displays user content in a clean white container

> 🔐 Only cliq members can access this route. If not authorized, the user is redirected. APA rules are enforced using `getCurrentUser()` and cliq membership validation.

---

### ✨ Visual Redesign (2025-07)

- 🖤 Feed is now **black-and-white themed** for safety, visual clarity, and emotional calm
- 📎 All feed content uses `BaseCard` styling — no floating content or masonry grids
- 🛠 Feature Panel uses **icon tiles** to preview in-development tools while providing real interaction on supported items

---

## 🧩 `Members` Page

**Route:** `/cliqs/[id]/members`

### 🔹 Purpose
Displays all members of the cliq, along with their role.
- If user is the owner:
  - Show `Promote`, `Demote`, or `Remove` buttons

> ⚠️ Role-changing actions call `/api/cliqs/[id]/member-actions` with appropriate action.

---

## 🧩 `Invite` Page

**Route:** `/cliqs/[id]/invite`

### 🔹 Purpose
Allows a cliq owner or moderator to invite someone by email and role (child, adult, parent).

### 🔹 Submission
POST to: `/api/invite/create`
- Handles duplicate checking, cliq membership verification, email delivery, and inviteRequest creation

> 👨‍👧 Child invites trigger parent-approval flow with plan selection and secure parent-child linkage.

---

## 📮 Invite Request Review (Parent)

**Route:** `/parent/invite-request`  
→ Fetches data from: `/api/parent/invite-request`

### 🔹 Purpose
When a parent receives an invite email (e.g. when their child is invited to join a cliq), they can:
- Click to review the invite
- Select a subscription plan (free, paid, or ebt)
- Create an account
- Authorize and link their child to the cliq

---

## 🧼 Final Flow Step: Approval Complete

**Route:** `/api/parent/approval-complete`

This API route:
- ✅ Finalizes the child’s signup and password
- ✅ Links the parent to the child (`ParentLink`)
- ✅ Updates the invite status (`used`)
- ✅ Logs the selected subscription plan (`stripeStatus`)

---

## 🔐 Safety Enforcement (APA Summary)

All sensitive routes:
- Require session via `getCurrentUser()`
- Use `force-dynamic` exports to prevent static inference errors
- Validate invite usage, cliq membership, and parent-child permissions
- Log high-trust actions with `userId`, `role`, and `cliqId` when applicable
