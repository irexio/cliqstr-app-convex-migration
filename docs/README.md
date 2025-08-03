# 📁 Cliqstr Docs Directory Overview

Welcome to the **Cliqstr Documentation Hub**, the living knowledge base for APA logic, platform architecture, feature specs, and route mapping. This folder is structured to help developers, advisors, and assistants quickly locate and trust key documentation.

---

## ✅ PRIMARY DOCUMENTS

### `ROUTES.md`
> **Purpose:** Canonical reference for all API and page routes. APA-safe, updated regularly.

### `APA-Flow-Scenarios.md`
> **Purpose:** Source of truth for how APA onboarding and invites work. Includes all child/adult invite permutations, parental controls, and approval gating.

### `CURRENT-APP-FLOWS.md`
> **Purpose:** Describes *actual* system behavior as implemented. Should be updated after major releases or QA passes.

### `PARENT-INVITE-CONTROLS.md`
> **Purpose:** Ongoing settings roadmap for parental controls, pre-approvals, and invite moderation. Use this to plan future phases of Parent HQ.

### `cliq_age_gating_spec.md`
> **Purpose:** Age restriction logic for public/semi-private cliqs. Critical for APA-compliant join validation.

### `cliq_notice_banner.md`
> **Purpose:** Feature spec for in-cliq alerts (birthdays, red alerts, admin notices). Fully implemented.

---

## 📁 ARCHITECTURE

### `cliq-architecture.md`
> **Purpose:** Developer onboarding and visual system flow. Explains cliq creation, feed structure, component layout, and API design patterns.

---

## 📁 ARCHIVE (Legacy Reference)

### `INVITE-FLOW-FIX-SUMMARY.md`
> Patch notes from July 2025. Useful for reviewing invite flow debugging history.

### `Model-Specs.md`
> Early schema definitions. Safe to archive now that Prisma models are fully documented.

---

## 📁 COMPLIANCE

### `APA-Flow-Verification.md`
> Snapshot audit from July 25, 2025. Includes notes on test mode, email verification handling, and child flow testing.
> ✅ Recommendation: Append retest results from current August implementation.

---

## 📌 MAINTENANCE NOTES
- Mark files with `✅` when verified post-deployment
- Add `Verified: [date]` tags at the top of implementation-sensitive files
- Create version tags per testing phase (e.g. `TEST-MODE-v2`)

---

For questions or proposed edits, contact Robyn or the APA lead developer.

