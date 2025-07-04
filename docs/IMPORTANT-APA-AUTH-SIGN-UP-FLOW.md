# 📘 Cliqstr Auth, Approval, and Dashboard Flow (APA Spec)

**Updated:** July 03 2025  
**Author:** Mimi Thomas (Mimi 💜🐧)  
**Purpose:** This document defines how Cliqstr handles authentication, parent approval flows, profile setup, and dashboard interactions. All flows follow APA (Aiden's Power Auth) safety standards.

---

## 🔐 1. Authentication Flow (Login + Sign-Up)

### ✅ Direct Sign-Up (No Invite Code)

| Step | Description |
|------|-------------|
| 1 | User visits `/sign-up` |
| 2 | Enters: `email`, `password`, `birthdate` |
| 3 | System calculates age from birthdate |
| 4 | Role is assigned: `Adult` (18+), `Child` (<18) |
| 5 | **If Adult:**
  - Account is created
  - `isApproved = true`
  - Redirect to `/profile/create`
| 6 | **If Child:**
  - Requires `parentEmail`
  - Creates account with `isApproved = false`
  - Adds record to `InviteRequest`
  - Sends parent email with approval link
  - Redirects child to "Waiting for approval" screen
| 7 | Once approved by parent:
  - `isApproved = true`
  - Child can sign in
  - Redirect to `/profile/create`

### ✅ Invite-Based Sign-Up

| Step | Description |
|------|-------------|
| 1 | User visits `/sign-up?inviteCode=XXX` from invite email |
| 2 | Invite code is validated |
| 3 | User enters `email`, `password`, `birthdate` |
| 4 | System calculates age and assigns role |

#### ➕ **If Adult (18+):**
| Step | Description |
|------|-------------|
| 5 | **Credit Card verification is required** as age-proof
| 6 | No charge is made — Stripe validates identity only
| 7 | After card validation:
  - User is shown plan selection page:
    - **Free Plan** → Access only to invited cliq
    - **Paid Plan** → Full features
| 8 | Account is created with `isApproved = true`
| 9 | User redirected to `/profile/create`, then `/my-cliqs`

#### 🧒 **If Child:**
| Step | Description |
|------|-------------|
| 5 | Requires `parentEmail` to proceed |
| 6 | Adds to `InviteRequest` for parent approval |
| 7 | Parent receives link, selects plan, and approves child |
| 8 | Once approved, child is added to cliq and sent to `/profile/create` |

### ✅ Login Flow

| Step | Description |
|------|-------------|
| 1 | User visits `/sign-in` |
| 2 | Credentials validated using `prisma.user.findUnique` + bcrypt |
| 3 | If `isApproved = false` → redirect to "Waiting for approval" |
| 4 | If valid → redirect to `/my-cliqs` |

---

## 👨‍👧 2. Parent Approval Flows

### A. Approval for Invited Child

| Step | Description |
|------|-------------|
| 1 | Adult invites a child via `/cliqs/[id]/invite` |
| 2 | Child signs up with invite code and `parentEmail` |
| 3 | `InviteRequest` created |
| 4 | Parent receives approval link |
| 5 | Parent selects plan (Free, Paid, EBT) and approves child |
| 6 | Child account updated → `isApproved = true` |
| 7 | Child logs in and sees invited cliq |

### B. Approval for Direct Child Signup

| Step | Description |
|------|-------------|
| 1 | Child signs up directly with `parentEmail` |
| 2 | `InviteRequest` created |
| 3 | Parent receives email with approval link |
| 4 | Parent selects plan and approves account |
| 5 | Child can log in and begin profile setup |

---

## 🧭 3. My Cliqs Dashboard

| Route | `/my-cliqs` |
|-------|------------|
| Access | Shown after login to any approved user |
| Contents | Displays all cliqs user has created, joined, or been invited to |
| Actions | `View` → `/cliqs/[id]`, `Invite` → `/cliqs/[id]/invite`, `Members` → `/cliqs/[id]/members` |

### Cliq Creation Flow
| Step | Description |
|------|-------------|
| 1 | User clicks "Create Cliq" |
| 2 | Form opens: `name`, `description`, `privacy`, `coverImage` |
| 3 | User assigned `Owner` role in `Memberships` |
| 4 | New cliq appears in `/my-cliqs`, user redirected to `/cliqs/[id]` |

---

## 🧑‍🎨 4. Profile Setup Flow

| Trigger | After sign-up or first login if profile is incomplete |
|---------|---------------------------------------------|
| Route | `/profile/create` |
| Fields | `username`, `avatar`, `bannerImage`, optional `bio` |
| Rules | `username` must be unique; children restricted by parent settings |
| Redirect | On save, user is sent to `/my-cliqs` |

---

## 🔚 Summary

This document defines how authentication, role assignment, child safety, and user onboarding are handled within Cliqstr. All developers (including Windsurf) should follow this spec for any auth, invite, parent, or profile feature.

