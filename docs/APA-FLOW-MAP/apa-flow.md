## 🔐 The Safer Platform We Deserve – Built by Parents, for Kids, Families, Friends — Everyone Fed Up With Being Sold Out

### 👋 What to Say When Someone Asks “What’s Cliqstr?”

- “It’s like Facebook, but only for the people you actually like.”
- “It’s social media without the stalkers, ads, or chaos.”
- “You get your people, your posts, your space — and none of the mess.”
- “No tracking. No selling your data. No strangers dropping into your kids’ DMs.”
- “It’s built for sanity instead of scale — invite-only, ad-free, and locked down by design.”

**Cliqstr is** a private, ad-free, AI-moderated social platform built for kids, families, and trusted groups — and for the exhausted parents trying to protect them. It’s invite-only. It’s role-based. It’s governed by APA (Aiden’s Power Auth) — a system where no child under 18 is ever activated without verified parent approval.

Every choice — from silent monitoring, to credit card identity verification, to EBT access — was made to prioritize protection over profit.

Cliqstr is where kids can post safely, parents can breathe easier, and everyone finally feels like they aren’t being mined, tracked, or ignored. It’s still fun, still social, and still full of joy — just without the harm.

This document outlines the end-to-end flow for sign-up, invite, and activation within Cliqstr — with APA (Aiden's Power Auth) enforcement baked into every step.

It includes role logic, file references, and APA safety triggers for:
- Adult sign-up
- Adult invite
- Child sign-up
- Child invite

---

### ✅ FLOW 1: Adult Signs Up and Creates First Cliq

| Step | What Happens | File(s) | Notes |
|------|---------------|---------|-------|
| 🧑 1. User clicks “Sign Up” | `/sign-up` | `app/sign-up/page.tsx` | Public route with `SlimLayout` or custom layout |
| 🧾 2. Sees sign-up form | `sign-up-form.tsx` | Inputs: `email`, `password`, `birthdate`, `inviteCode?` |
| 🔐 3. Age calculated → role set | `sign-up-form.tsx` → `api/sign-up/route.ts` | If age ≥ 18 → assign `role = 'adult'` |
| 🧠 4. POST to register API | `api/sign-up/route.ts` | Validates birthdate, invite (if present), hashes password, creates `User` |
| 🍪 5. Auth cookie set | `login()` helper | Signs user in immediately on success |
| 🔁 6. Redirect to setup | `/setup-profile` | `app/setup-profile/page.tsx` → loads `SetupProfileClient.tsx` |
| 🖼 7. User sets display name + avatar | `SetupProfileClient.tsx` | Optional banner, bio, etc |
| 💾 8. Profile POST saved | `api/profile/update/route.ts` | May hit this OR update during setup wizard |
| 🧭 9. Redirect to dashboard | `/my-cliqs` | `app/my-cliqs/page.tsx` → loads `MyCliqsPage.tsx` or similar |
| ➕ 10. User clicks “Create Cliq” | `/cliqs/build` | `app/cliqs/build/page.tsx` or `CreateCliqForm.tsx` |
| 🧠 11. Cliq created in DB | `api/cliqs/create/route.ts` (or similar) | User becomes owner, first member |
| 🏡 12. Redirect to cliq page | `/cliqs/[id]` | `app/cliqs/[id]/page.tsx` loads `CliqFeed`, etc |

---

### ✅ FLOW 2: Adult Is Invited to Cliq

> **Note:** Invitees must verify adulthood with a credit card. This is not for billing — it's to ensure only verified adults access Cliqstr. 
> 
> *You will not be charged for joining the cliq you were invited to. Should you choose to explore Cliqstr, we offer a 30-day free trial where you can participate in interest-based public cliqs and create private, public, and semi-private cliqs — all without ads, tracking, or noise. Cliq here to sign up or continue.*

| Step | What Happens | File(s) | Notes |
|------|---------------|---------|-------|
| ✉️ 1. Invite received | `/join?code=INV123` | `app/join/page.tsx` or handled in `sign-up-form.tsx` | Invite code is entered or auto-filled via URL |
| 🔍 2. Code validated | `api/validate-invite/route.ts` | Checks if code is real and role matches (should resolve to 'adult') |
| 🧾 3. Sees sign-up form | `sign-up-form.tsx` | Invite code locked-in; fields: `email`, `password`, `birthdate` |
| 🔐 4. Age ≥ 18 → approved as `role = 'adult'` | `api/sign-up/route.ts` | APA assigns adult role automatically |
| 🍪 5. Auth cookie set | `login()` helper | Auto-login on success |
| 🔁 6. Redirect to `cliqs/[id]` | Based on invite destination | Automatically joins the cliq that invited them |
| 🏡 7. Cliq loaded | `/cliqs/[id]` | `app/cliqs/[id]/page.tsx` → feed, members, posts |

---

### 🔐 APA Policy Notes:
- All users under 18 are treated as `role = 'child'`
- Child accounts require **parental email approval** + **Stripe payment or trial selection**
- No account is activated until the parent verifies + chooses a plan
- `/parents-hq` gives parents control over permissions:
  - Public cliqs (on/off)
  - Invite friends (requires approval or auto)
  - Silent monitoring (on/off)
- Parent must use credit card to verify identity — free plan still requires Stripe checkout or EBT request

---

### ✅ FLOW 3: Child Signs Up

| Step | What Happens | File(s) | Notes |
|------|---------------|---------|-------|
| 👶 1. User visits sign-up | `/sign-up` | `app/sign-up/page.tsx` | Same entry point as adults |
| 🧾 2. Fills out form | `sign-up-form.tsx` | Inputs: `email`, `password`, `birthdate`, optional inviteCode |
| 🔐 3. Age check triggers `role = 'child'` | `sign-up-form.tsx` → `api/sign-up/route.ts` | If age < 18, user becomes `child` |
| 🧠 4. Child account created in `User` | `api/sign-up/route.ts` | `ParentLink` not yet created — account inactive |
| 📩 5. Parent notified | `api/send-parent-email/route.ts` | Parent receives invite to approve child account |
| 🕓 6. Redirect to holding page | `/awaiting-approval` | `app/awaiting-approval/page.tsx` — tells child they're waiting on a parent |
| 🧭 7. If approved, parent creates credentials | `/parents-hq` → approval screen | Parent sets username + password or confirms existing |
| ⚙️ 8. Parent chooses permissions | `/parents-hq` | Can allow/disallow public cliqs, friend invites, silent monitoring |
| ✅ 9. Child account activated | `api/complete-approval/route.ts` | `ParentLink` created, child can access dashboard |
| 🧠 10. Redirect to `setup-profile` | `app/setup-profile/page.tsx` | Child completes profile before joining any cliqs |

------|---------------|---------|-------|
| 👶 1. User visits sign-up | `/sign-up` | `app/sign-up/page.tsx` | Same entry point as adults |
| 🧾 2. Fills out form | `sign-up-form.tsx` | Inputs: `email`, `password`, `birthdate`, optional inviteCode |
| 🔐 3. Age check triggers `role = 'child'` | `sign-up-form.tsx` → `api/sign-up/route.ts` | If age < 18, user becomes `child` |
| 🧠 4. Child account created in `User` | `api/sign-up/route.ts` | `ParentLink` not yet created — account inactive |
| 📩 5. Parent notified | `api/send-parent-email/route.ts` | Parent receives invite to approve child account |
| 🕓 6. Redirect to holding page | `/awaiting-approval` | `app/awaiting-approval/page.tsx` — tells child they're waiting on a parent |
| 🧭 7. If approved, parent creates credentials | `/parents-hq` → approval screen | Parent sets username + password or confirms existing |
| ✅ 8. Child account activated | `api/complete-approval/route.ts` | `ParentLink` created, child can access dashboard |
| 🧠 9. Redirect to `setup-profile` | `app/setup-profile/page.tsx` | Child completes profile before joining any cliqs |

---

### ✅ FLOW 4: Child Is Invited

| Step | What Happens | File(s) | Notes |
|------|---------------|---------|-------|
| ✉️ 1. Child receives invite | `/join?code=XYZ` | `app/join/page.tsx` → invite code prefilled |
| 🧾 2. Fills out form | `sign-up-form.tsx` | Invite code used to assign `role = 'child'` |
| 🔐 3. Sign-up triggers parental contact | `api/sign-up/route.ts` + `send-parent-email.ts` | Parent alerted, child paused at `awaiting-approval` |
| 📬 4. Parent visits approval flow | `/parents-hq` | Approves or declines request |
| ⚙️ 5. Parent selects permissions | `/parents-hq` | Can toggle invite approval, public cliqs, silent monitoring |
| 💳 6. Parent selects Stripe trial/plan | `create-checkout-session/route.ts` | Verification required even for free plan |
| 🧠 7. Child account finalized | `complete-approval/route.ts` | `User`, `ParentLink`, `Invite`, and `CliqMember` created |
| 🎉 8. Child joins cliq | `/cliqs/[id]` | Auto-added to original cliq from invite |

------|---------------|---------|-------|
| ✉️ 1. Child receives invite | `/join?code=XYZ` | `app/join/page.tsx` → invite code prefilled |
| 🧾 2. Fills out form | `sign-up-form.tsx` | Invite code used to assign `role = 'child'` |
| 🔐 3. Sign-up triggers parental contact | `api/sign-up/route.ts` + `send-parent-email.ts` | Parent alerted, child paused at `awaiting-approval` |
| 📬 4. Parent visits approval flow | `/parents-hq` | Approves or declines request |
| 💳 5. Parent selects Stripe trial/plan | `create-checkout-session/route.ts` | Verification required even for free plan |
| 🧠 6. Child account finalized | `complete-approval/route.ts` | `User`, `ParentLink`, `Invite`, and `CliqMember` created |
| 🎉 7. Child joins cliq | `/cliqs/[id]` | Auto-added to original cliq from invite |

---

Each will follow this same format.
Once all flows are mapped and verified, this document becomes the APA baseline for both **Cliqstr** and **CliqSafe**.

---

**Author:** Mimi & Aiden, June 21 2025  
**Security Layer:** APA-Hardened — Do Not Alter Without Approval

