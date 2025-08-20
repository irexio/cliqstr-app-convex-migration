# PHQ + Invite Flows — Testing Checklist

This checklist isolates testing tasks from general TODOs.

## 0) Safety: Confirm Local DB
- Ensure `.env.local` exists and `DATABASE_URL` points to your LOCAL dev DB (not production).
- If unsure, open `prisma/schema.prisma` to see the provider and verify connection by running `npx prisma db pull` (non-destructive).

## 1) Reset Prisma Database (Destructive)
Do NOT run in production.

Suggested sequence (Windows PowerShell):
1. Stop any dev servers
2. Reset DB and run migrations + seed (seeds admin user)

Proposed commands (will not auto-run):
- Kill dev server/port
  - taskkill /F /IM node.exe || echo 'No node processes found'
  - npx kill-port 3000
- Reset DB with seed
  - npx prisma migrate reset --force

Notes:
- `prisma/seed.ts` creates:
  - admin@cliqstr.com / test1234
  - An admin `Account` (Parent), and a test cliq
- You can re-run seed anytime: `npx prisma db seed`

## 2) Verify Seed Admin
- Sign in as `admin@cliqstr.com` / `test1234`
- Expected: lands on dashboard; has Parent account and one cliq

## 3) Test Matrix
Use unique emails per case to avoid cross-test collisions. Examples provided.

### A) Invite Adult — New Email
- From admin, create an Adult invite to: `new.adult+1@cliqstr.test`
- Expected:
  - Invite created with targetState = `new_user`
  - Email link → Invite page → PHQ wizard shows required steps for adult
  - After completion, account role = Adult/Parent per flow rules

### B) Invite Adult — Existing Adult
- Pre-create/sign up `existing.adult+1@cliqstr.test` as Adult (no parent role)
- Send invite to same email
- Expected:
  - targetState = `existing_user_non_parent`
  - Flow prompts sign-in/upgrade path (no duplicate account)

### C) Invite Adult — Existing Parent (your correction)
- Pre-create/sign up `existing.parent+1@cliqstr.test` with Parent role
- Send Adult invite to same email
- Expected:
  - targetState = `existing_parent`
  - Minimal friction; ensures proper routing without duplicate steps

### D) Invite Child — New Parent Email
- From admin/parent, create a Child invite with parent email: `new.parent+child1@cliqstr.test`
- Expected:
  - Invite shows parent contact correctly
  - Invite link → PHQ wizard → Parent signup → Child creation → Permissions → Success

### E) Invite Child — Existing Adult (convert to Parent)
- Ensure `existing.adult+2@cliqstr.test` exists as Adult (not Parent)
- Create Child invite with that parent email
- Expected:
  - targetState = `existing_user_non_parent`
  - Flow asks to upgrade to Parent, then child creation

### F) Invite Child — Existing Parent (added to existing PHQ)
- Ensure `existing.parent+2@cliqstr.test` already has Parent role
- Create Child invite with that email
- Expected:
  - targetState = `existing_parent`
  - Flow skips signup/upgrade → child creation → permissions

### G) Sign Up Adult (direct)
- Visit direct signup and create `direct.adult+1@cliqstr.test`
- Expected:
  - Account created; verify plan/role defaults

### H) Sign Up Child (direct)
- Depending on gating, ensure proper restriction or parent linkage requirement
- Expected:
  - Child cannot bypass parent controls; verify enforcement

## 4) What to Capture
- For each case:
  - Invite record status transitions
  - `targetState` detected server-side
  - Any redirects vs server-driven wizard step decisions
  - Screenshots of success states
  - Logs for failures (api route + browser console)

## 5) Quick References
- Seed file: `prisma/seed.ts`
- Scripts:
  - `npm run seed:admin` → ensures admin exists via `scripts/ensure-admin.cjs`
- Parents HQ page/wizard code:
  - `src/app/parents/hq/page.tsx`
  - `src/components/parents/StreamlinedParentsHQWizard.tsx` (if present)

## 6) Known Gotchas
- Cookie domain issues can affect invite flow; test in a clean/incognito window
- Ensure invite status remains `pending` until child creation completes
- Ensure parent email source for child invites is `trustedAdultContact`
