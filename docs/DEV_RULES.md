# Cliqstr Dev Rules

These rules apply to all contributors (human or AI). Follow them exactly.

## 1. Do Not Delete
- Do not delete files, routes, or components.
- If you believe something is unused, **move it to `/deprecated/`** instead of deleting.
- Add a comment in `/deprecated/README.md` explaining why it was moved.
- Final deletion happens only after **manual review and approval**.

## 2. Do Not Duplicate
- Before creating any new route, page, or component:
  1. **Search the repo** (`git grep "routeName"` or search in VS Code).
  2. Confirm it does not already exist.
  3. If it exists, update/extend it instead of creating a new one.
- The **only intentionally new route** post-migration is `/sentinel` (admin dashboard).
- All other flows (sign-in, sign-up, invites, cliqs, Parents HQ) already exist.

## 3. Prove Persistence
- After any auth or invite change, prove persistence by:
  - Running the mutation in **Convex Dashboard → Functions**.
  - Showing a row in the **Data tab** (`users`, `accounts`, `invites`, etc.).
- Do not claim “fixed” without proof.

## 4. One Flow at a Time
- Debug and QA **one flow end-to-end** before moving to the next.
  1. Adult signup → confirm rows in `users` + `accounts`.
  2. Child signup → New Parent.
  3. Invite Adult.
  4. Invite Child → Existing Parent.
  5. Invite Child → Existing Adult (upgrade).
- No skipping ahead.

## 5. Environments
- `.env.local` must point to **dev** (`adorable-chicken-923`).
- Vercel prod env must point to **prod** (`upbeat-hedgehog-998`).
- Do not enable Preview Deployments.
- Always confirm with `npx convex whoami`.

---
