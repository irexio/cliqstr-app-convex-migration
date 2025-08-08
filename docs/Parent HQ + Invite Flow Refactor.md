Parents HQ + Invite Flow Refactor 
Purpose / August 8, 2025

Refactor and simplify Parents HQ and invite acceptance flows so they are clean, predictable, and free of legacy/duplicate pages.
Background

    Multiple Parents HQ pages, routes, and components exist; they are inconsistent and partially broken.

    Invite flows are split across multiple pages (/invite/parent, /invite/adult, /invite/accept) with duplicate logic.

    Adults should never see Parents HQ — only parents of invited children should.

    Email verification currently happens inconsistently; it must be unified.

    Legacy plan/billing checks are tangled in invite flows; these must be removed.

    Most invite recipients are new users; flow must work for logged-out users and prefill email at sign-up.

Refactor Goals

    Single Parents HQ page: /parents/hq

        Handles child invite approval and ongoing child management.

    Single accept entry: /invite/accept?code=...

        Uniform email verification at this step.

        Branches:

            Adult invite: accept + dashboard

            Child invite: go to HQ for approval.

    Read-only invite validator (/api/invites/validate) — no side effects.

    Minimal server POSTs:

        /api/verify-from-invite — set isVerified=true (idempotent).

        /api/accept-invite — adult join flow.

        /api/parent/approval-complete — parent approves child.

    ParentDashboard wired to real API:

        GET /api/parent/children (list)

        POST /api/parent/children (create)

    Middleware gates:

        Pending child blocked from /cliqs + /my-cliqs-dashboard.

    Remove or redirect unused HQ pages and legacy invite pages.

Non-Goals

    No schema changes.

    No new pages unless explicitly replacing legacy pages.

    No billing enforcement in invite flows.

    No SMS integration at this stage (email only).

Step-by-Step Plan

You will execute these steps one at a time (I will paste each step manually to you).

Step 1 — /invite/accept Update

    Purpose: Branch correctly for adult vs child invites, verify email once.

Step 2 — /api/invites/validate Update

    Purpose: Read-only invite check, unified return format.

Step 3 — /api/verify-from-invite Add

    Purpose: Idempotently set isVerified=true for the logged-in user.

Step 4 — /api/accept-invite Update

    Purpose: Adult invite join flow.

Step 5 — ParentsHQContent Update

    Purpose: Simplify auth logic; allow Adults to approve; remove auto-upgrade and verify-parent detours.

Step 6 — ParentDashboard Update

    Purpose: Wire create-child to POST /api/parent/children; refresh list after creation.

Step 7 — /api/parent/children Update

    Purpose: Ensure GET lists children; POST creates + links child.

Step 8 — /api/parent/approval-complete Update

    Purpose: Canonical child-approval transaction.

Step 9 — Middleware Update

    Purpose: Gate pending child access; keep /invite/* public.

Step 10 — Remove/Redirect Legacy Pages

    Purpose: Redirect or delete old HQ and invite pages.

Step 11 — Update FLOW.md & ROUTES.md

    Purpose: Document new canonical routes and flow.

After all steps are complete:

    Verify against the acceptance checklist in refactor.md.

    Confirm WS updates FLOW.md and ROUTES.md to match the new architecture.

    Remove all deprecated files from repo.