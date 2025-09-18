# APA — Aiden’s Power Auth (v1.0)

APA is Cliqstr’s canonical security protocol. It makes authentication and access control server-first, consistent, and simple to reason about.

## Core Principles
- Server-first auth: all protected pages and API routes resolve the user on the server.
- Single guard: call `getCurrentUser()` + `enforceAPA(user)` everywhere.
- Central session: iron-session with typed `SessionData` (no tokens on client).
- SSOT for age: APA decisions rely on `accounts.birthdate` and account fields.
- No public access: every route requires authentication; “public cliqs” means visible to authenticated, plan-holding members.
- Client hooks only in client components: UI and Convex hooks live in `_client.tsx`.

## Base URL Policy
- Emails: `const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cliqstr.com"`.
- Server code: prefer `req.nextUrl.origin`; in production, use `NEXT_PUBLIC_SITE_URL` if set.

## Session
- Library: iron-session.
- Cookie name: `cliqstr-session`.
- Max age: 1 hour (extendable by policy).
- `SessionData` fields (subset):
  - `userId`, `issuedAt`, `lastActivityAt`, `expiresAt`, `idleCutoffMinutes`.
  - Compatibility: `createdAt`, `lastAuthAt`, `refreshIntervalMinutes`.

## Optional User Cache
- KV-backed cache for user payloads (60s TTL) used by `getCurrentUser()` when `KV_REST_API_URL` and `KV_REST_API_TOKEN` are present.

## Guard Pattern
- Server components and API routes must call:

```ts
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { enforceAPA } from "@/lib/auth/enforceAPA";

export default async function Page() {
  const user = await getCurrentUser();
  enforceAPA(user);
  return <ClientView user={user} />; // if the page uses client hooks
}
```

- API Routes:
```ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { enforceAPA } from "@/lib/auth/enforceAPA";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  enforceAPA(user);
  // business logic...
  return NextResponse.json({ ok: true });
}
```

## Middleware
- Minimal: static and API pass-through, and production canonical host redirect `www.cliqstr.com -> cliqstr.com`.
- No auth/status fetches in middleware.

## Special Cases (Policy)
- Public Cliqs: accessible to authenticated users with a plan; still behind APA.
- Profiles: `/profile/[username]` requires APA; visibility governed by profile settings.
- Invites: acceptance routes require APA. If not signed in, redirect to signup/login, then back to acceptance.
- Account Hub: `/account/*` pages require APA; stubs include TODOs for Resend/Stripe/session wiring.

## Server/Client Split
- Pages using Convex hooks or other client features are split:
  - `page.tsx` (server): `getCurrentUser()` + `enforceAPA(user)` then render `_client.tsx`.
  - `_client.tsx`: contains `useQuery`, UI state, and client interactions.

## Email Links
- Build all links with `BASE_URL` as above to avoid domain-scoping problems and spam filters.

## Test Protocol
- Build locally: `npm run build` should pass without type errors.
- Verify redirects: sign-in, choose plan, dashboard, and protected pages behave per APA.
- Invite flow:
  - Adult to adult: allowed.
  - Adult/Parent inviting child: requires parental approval; verify acceptance path and APA redirect when unauthenticated.
- Profile visibility: ensure APA required, and profile privacy respected within the app.

## Change Summary in this Overhaul
- Centralized enforcement (`getCurrentUser` + `enforceAPA`) across protected pages and API routes.
- Server/client split throughout protected routes (`_client.tsx` pattern).
- Account hub APA-guarded and prepared with clear TODOs for Resend/Stripe.
- Invite, cliqs, profiles, and Parents HQ hardened.
- Optional KV cache wired into `getCurrentUser()`.

## TODO Wiring (Pointers)
- Change Email: Resend-backed verification/update flow.
- Change Password: reset flow or direct change route.
- Security: session/device management endpoints.
- Billing: Stripe customer portal link.

---

APA is a living document; keep it current as flows evolve.
