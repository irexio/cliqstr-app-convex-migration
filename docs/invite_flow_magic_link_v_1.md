# Invite Flow – Magic Link v1 - 08/19/2025

## Purpose
Define the standard, APA‑compliant invite process for Cliqstr. This reuses the same one‑time token pattern already powering password resets, extended to child and adult invites.

---

## Core Principles
- **Magic link only (v1):** Every invite is a one‑time URL with a token.
- **APA compliant:** All sessions created by invite redemption use `iron-session` cookies (no JWTs).
- **Expiry:** 7‑day limit, single use.
- **Audit trail:** All invites logged with `issuedAt`, `expiresAt`, `usedAt`, `issuerId`, `targetEmail`, `childName` (if applicable).
- **Policy alignment:**
  - Child invites → parent email only.
  - Parent must approve before child account is created/linked.

---

## Data Model – Invite
- `id`
- `tokenHash`
- `type: 'adult' | 'child'`
- `cliqId`
- `targetEmail`
- `childFirstName` / `childLastName` (child only)
- `issuerUserId`
- `expiresAt` (+7 days)
- `usedAt` (nullable)
- `metadata`

---

## Flow

### 1. Invite Issued
- User enters invite details (parent email + child name, or adult email).
- Backend creates Invite record.
- Backend generates opaque token, stores hash.
- Email sent with **magic link**: `https://cliqstr.com/invite/{token}`.

### 2. Invite Redeemed (Click)
- Parent/adult clicks link.
- Server validates:
  - Token exists, not expired, not already used.
- Server creates APA session (iron-session cookie).
- `session.inviteId = invite.id`.
- Redirects to PHQ (child) or cliq join page (adult).

### 3. Parent HQ (Child Flow)
- Reads `session.inviteId`.
- Loads Invite record.
- Pre-populates PHQ form with:
  - Parent email (read‑only).
  - Child first/last name (editable or locked).
  - Cliq name + inviter name (context panel).
- Parent approves.

### 4. Approval Submission
- Backend validates invite again.
- Creates/links Parent account (if not exists).
- Creates/links Child account.
- Adds child to Cliq.
- Marks Invite `usedAt = now()`.
- Writes audit log: `INVITE_ACCEPTED`, `CHILD_CREATED_OR_LINKED`, `CHILD_ADDED_TO_CLIQ`.
- Clears `session.inviteId`.

### 5. Adult Flow (Private & Semi‑Private)
- Adult receives magic link invite.
- On click → session created, cliq join attempted.
- If private cliq: direct join.
- If semi‑private: membership is marked pending until owner/mod approves.
- Invite marked `usedAt` when join attempt recorded.

---

## Security & UX
- **Replay protection:** Used links redirect to friendly “Already used” state.
- **Expired:** Redirect to “Invite expired” with Resend CTA.
- **Email binding:** Token only valid for the `targetEmail` in invite.
- **Audit logging:** Every step written to append‑only log.

---

## Phase Rollout
- **Phase 1 (now):** Email magic links only, all invites.
- **Phase 2:** Add Twilio SMS delivery of same magic links.
- **Phase 3 (optional):** Display short branded code alongside link in emails/SMS as backup once flow is stable.

---

## Acceptance Criteria
- Clicking magic link always results in:
  - A valid session cookie.
  - PHQ form pre-filled for child invites.
  - Correct cliq join/pending state for adult invites.
- All edge cases (expired, already used, email mismatch) handled gracefully.
- Database reflects `usedAt` and audit entries for every invite redemption.

---

## Technical Underpinnings (bundle)

### Reuse the Password‑Reset Pattern
- **Same mechanism**: one‑time, time‑boxed token delivered by link.
- **Differences for invites**: token payload ties to `{ cliqId, targetEmail (parent/adult), childFirstName, childLastName? }` and invite type.

### Shared Token Service (single source of truth)
Create a tiny internal service used by both reset **and** invites:
- `issueToken({ kind:'invite'|'reset', email, data, expiresInMs }) => { token, expiresAt }`
- `redeemToken(token) => { kind, email, data }` (validates hash, expiry, usedAt, sets usedAt)
- Stores **hash**, not raw token. Expiry default **7 days** for invites.

### Session Pattern (APA)
- **Creation & read must match**: `getIronSession(request, response, sessionOptions)` everywhere (no cookieStore variant).
- On invite redeem: set APA session, write `session.inviteId = invite.id`, then redirect to PHQ.
- All Prisma/crypto/session routes **runtime = 'nodejs'**.

### PHQ Pre‑Population
- Server SSR reads `session.inviteId` → loads Invite + Cliq + Inviter.
- Pre-fill (read‑only) **parent email**; pre-fill (editable or locked) **child first/last**.
- Context panel shows **Cliq name** and **Invited by**.

### Security Controls
- One‑time use (`usedAt` set on success, replay shows “Already used”).
- 7‑day expiry (graceful “Resend” flow after).
- Email binding: token only valid for `targetEmail` in invite.
- Rate‑limit issue/resend/accept by IP + email.
- Audit log entries: `INVITE_ISSUED`, `INVITE_ACCEPTED`, `CHILD_CREATED_OR_LINKED`, `CHILD_ADDED_TO_CLIQ`.

### Adult Invites (Private & Semi‑Private)
- Private: accept → join immediately.
- Semi‑private: accept → membership **pending** owner/mod approval; invite considered used after join attempt recorded.

### Twilio/SMS (Phase 2)
- Send **the same magic link** via SMS.
- Enable STOP/START/HELP handling via Twilio Messaging Service; log delivery status; fallback to email on failure.

---

## CI / QA Guardrails (keep us from regressing)
1) **Type & Lint**: `tsc --noEmit` and ESLint block unused/ dead code.
2) **Runtime checker**: fail if a route that imports Prisma/iron‑session exports `runtime = 'edge'`.
3) **Playwright smoke (under 60s)**
   - Redeem seeded child invite → `/parents/hq` renders heading + **Approve** button.
   - Approve → `invite.usedAt` set; child linked to correct cliq.
   - Expired/used tokens show correct screens.
4) **API sanity**: `POST /api/parents/approve` idempotent (double‑submit doesn’t double‑create).
5) **Docs gate**: PRs touching invites must confirm this doc + PHQ Pre‑Population doc are current.

---

## Rollout Phases (unchanged)
- **Phase 1 (now)**: Email magic links only.
- **Phase 2**: Add Twilio SMS of same link.
- **Phase 3 (optional)**: Show short branded code in comms as backup once v1 is stable.

---

✅ This bundle merges design + technical + QA so this file remains the **single source of truth** for invite behavior.

