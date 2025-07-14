# Cliqstr Living Model Spec

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

Users can now enter an invite code directly on the site, whether shared by a parent, friend, or trusted group admin. This supports users who may not have received a clickable link or SMS but still require access.

- Invite codes are submitted through the dedicated invite code field
- All invite codes are validated via `/api/invites/validate`
- Invite code usage **does not bypass APA**:
  - If the user is under 18, birthdate must still be submitted
  - If a child, parent approval and credential setup are still required
  - If an adult, user proceeds to `/choose-plan`
- The invite is still logged, traced, and linked to the inviter for audit tracking and abuse prevention

### SMS Invite Logic

SMS invites are now a core part of Cliqstr's invite-based onboarding flow. Their purpose is to reduce friction, increase accessibility for mobile-first users, and bring the product into more natural social channels.

- All SMS invites are sent through secure, logged channels
- Invites contain unique tokens that map to a cliq and must be validated at `/api/invites/validate`
- SMS invite links do not bypass APA gates
  - Children must still enter birthdate and receive parental approval
  - Adults are sent to sign-up and then `/choose-plan`
- Each invite is linked to the inviter, IP, and timestamp for audit control and abuse prevention

### 1. Direct Sign-Up (No Invite)

- Users provide: email, birthdate, password
- Age is calculated client-side and passed server-side
- Branching:
  - `18+` → sent to `/choose-plan`
  - `<18` → parent email required → redirect to `/awaiting-approval`

### 2. Invite-Based Join

- Receives invite via email or SMS
- Opens invite → triggers validation (`/api/invites/validate`)
- Flow:
  - If adult → redirect to sign-up → pre-fills cliq → plan selection
  - If child → requires parent approval → same as direct child flow

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

## POST + CLIQ LIMITS (Plan-Based)

| Plan        | Max Posts     | Post Expiry | Max Cliqs    |
| ----------- | ------------- | ----------- | ------------ |
| Free Trial  | 25            | 90 days     | 1            |
| Premium     | 50            | 90 days     | 5            |
| Group Plan  | 100           | 90 days     | 10           |
| Family Plan | 25 per member | 90 days     | 3 per member |

---

## PARENT HQ POWERS

- Approve child account access
- Enable/disable:
  - Public cliq creation
  - Sending invites
  - Cliq-level visibility
- View:
  - Child posts
  - Invites sent
  - Cliq memberships
- Cannot be seen by child (silent observer)

---

## FEATURE ROADMAP

- **Guided Setup by Role (Pip Logic)**: Pip dynamically adjusts guidance and language based on user role. Parents are welcomed with prompts like “Would you like to monitor or join your child's cliq?” Kids hear friendly encouragement like “Let’s build your cliq!” while adults are guided through social discovery with messages like “Who are you here to connect with?” This tone-aware onboarding helps reinforce APA rules while keeping the experience joyful and clear.

- **Post Expiration Feedback**: Users are shown a countdown label (e.g. "Expires in 89 days") on each post. Pip may gently notify users before posts expire, reinforcing the privacy-centered rhythm of the platform.

- **Red Alert Safety System**: If a child user triggers or selects a Red Alert, the system immediately notifies their parent account. If the user is not a child, the alert routes to the AI moderation layer trained to suspend harmful content instantly and notify both the platform's human moderation team and administrator. This ensures critical safety escalation without delay.
  These are planned features intended to support joy, learning, and resilience:

- **AI Moderation**: A hybrid AI + human system to flag content that may be inappropriate, harmful, or misleading. AI moderation will always err on the side of caution and respect APA standards.

- **Homework Helpline**: An AI-powered assistant for children and teens to get learning support while maintaining comprehension integrity This tool will never provide direct answers or complete assignments. Instead, it is designed to guide children through critical thinking by asking the right questions, offering encouragement, and helping them understand rather than simply produce answers Includes emotional check-ins and gentle offline activity nudges.

- **Games & Challenges**: Invite-only and cliq-specific recreational tools designed to foster play, creativity, and group bonding across age groups.

- **Pip and Pippy Onboarding**: Friendly, lovable digital companions who guide users — especially children — through sign-up, profile setup, and invite flows. Pip and Pippy reinforce safe digital behavior and celebrate small social wins to cultivate a sense of belonging.

---

## 🔴 Red Alert Safety System (APA Feature)

- **Purpose:**  
  Allows a child or adult user to immediately flag a cliq or situation for parental or moderator intervention.

- **Trigger Conditions:**  
  - Available to all authenticated users (child or adult) from within a cliq.
  - Red Alert triggers must include a valid `cliqId` and may include an optional reason.

- **Escalation Logic:**  
  - **If triggered by a child:**  
    - All parents within the cliq (based on membership + role = 'parent') are notified via email (`sendParentAlert()`).
    - The alert is logged to the `redAlert` table with `userId`, `cliqId`, `timestamp`, and optional reason.
    - This happens silently — the child does not see which parents are notified.

  - **If triggered by an adult:**  
    - The alert is not routed to parents.
    - Instead, it is marked as `escalated: true` and queued for future AI or human moderation.

- **Privacy Enforcement:**  
  - Red Alert notifications do not appear in the user interface or cliq history.
  - The identity of parent observers is never revealed to children.
  - Alerts are stored for audit and moderation purposes only.

- **Planned Enhancements:**  
  - SMS escalation for verified parent accounts.
  - AI-powered moderation review queue for non-child alerts.
  - Repeated alerts in the same cliq may trigger temporary cliq lockdown.


## LEGAL & PRIVACY FRAMEWORK

- **Jurisdictional Compliance Disclaimer**: While Cliqstr enforces age verification and APA protections, it is the responsibility of the user (or the user’s legal guardian) to comply with local laws. Users accessing Cliqstr from regions where child social media access is restricted (e.g., Australia) must ensure legal compliance. Cliqstr reserves the right to geo-restrict services in certain regions.

- **VPN & Access Awareness**: The platform cannot prevent VPN circumvention but does log originating IPs and access metadata for audit purposes. Age and parental checks are still enforced regardless of IP or device spoofing.

- **Audit Logging**: All invites (email, SMS, code-based), cliq joins, post creations, and alert triggers are logged with user ID, inviter ID, IP, and timestamp to support enforcement, parental visibility, and abuse investigation.

## CURRENT + PLANNED TECH STACK

### Core Stack (Active)

- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Backend**: Node.js, Prisma ORM, API Routes (Next.js)
- **Database**: Neon (PostgreSQL, serverless)
- **Auth**: APA (custom logic), session-based with role enforcement
- **Storage**: Vercel serverless functions, temporary image/object storage
- **Email**: Resend
- **SMS**: Twilio (planned, currently routing through manual)

### Planned Enhancements

- **AI Services**: OpenAI (moderation, Homework Helpline)

- **PWA Optimization**: Full offline-ready PWA setup

- **Mobile App**: Capacitor wrapper for iOS/Android post-launch

- **Analytics**: Privacy-first tracking (optional, aggregate only)

- **Monitoring & Error Tracking**: Sentry or equivalent

- **No Public Directory**: Cliqstr does not allow global search or browsing of user profiles. Only shared cliq members can view one another, and only with proper role permissions and APA approval.

- **PWA and Mobile Accessibility**: Cliqstr is optimized for mobile-first access and will be progressively enhanced as a PWA, with future potential for Capacitor-based deployment.

Cliqstr enforces strict internal safeguards and public terms, including:

- **Terms of Use include age-based legal responsibilities** (e.g., COPPA, GDPR - exceeding age 13 covering through 17)
- **SMS invites** are logged and filtered for potential abuse, and cannot bypass APA gates
- **Data is never shared or sold**. Posts auto-delete after 90 days to minimize long-term exposure

---

## TEST COVERAGE ROADMAP

- `red-alert.test.js`

  - Trigger red alert as child → parent is notified
  - Trigger red alert as adult → AI moderation activated
  - Ensure alert is logged, flagged, and escalated to human moderation

- `auth.test.js`

  - Sign up (adult/child)
  - Sign in valid/invalid
  - Session role check

- `invite-code.test.js`

  - Validate invite
  - Invite as child (APA approval required)

- `parent-approval.test.js`

  - Complete parent approval
  - Post-approval child access
  - Parent HQ visibility test

---

## Source of Truth

This document is the canonical reference for Cliqstr's logic, vision, and safety model. All changes to app behavior, role permissions, or APA enforcement must be reflected here.

## Revision Log

| Date       | Author | Summary                                                      |
| ---------- | ------ | ------------------------------------------------------------ |
| 2025-07-12 | Robyn  | Initial share with team (Vic, Rachel, Jordan, Tom, Michelle) |
| 2025-07-13 | Aiden  | Added Overview & Vision section                              |
| 2025-07-13 | Aiden  | Added source of truth + revision log                         |
| 2025-07-13 | Aiden  | Added feature roadmap, SMS flow, legal protections           |
| 2025-07-13 | Aiden  | Added Pip and Pippy onboarding logic                         |
| 2025-07-13 | Aiden  | Added developer/AI enforcement clause                        |

## Stakeholder Comments Zone

-

---

